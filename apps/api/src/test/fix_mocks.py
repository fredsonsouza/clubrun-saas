import os
import re

def update_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    modified = False
    
    # 1. Ensure prisma mock includes all necessary models
    prisma_mock_match = re.search(r'prisma: \{([^\}]*)\}', content, re.DOTALL)
    if prisma_mock_match:
        prisma_body = prisma_mock_match.group(1)
        # Models to ensure are mocked
        models_to_add = []
        if 'user:' not in prisma_body:
            models_to_add.append('user: { findUnique: vi.fn(), findFirst: vi.fn(), update: vi.fn() }')
        if 'auditLog:' not in prisma_body:
            models_to_add.append('auditLog: { create: vi.fn() }')
        if 'invoice:' not in prisma_body:
            models_to_add.append('invoice: { findFirst: vi.fn() }')
        
        if models_to_add:
            addition = ',\n    '.join(models_to_add) + ','
            content = content.replace('prisma: {', f'prisma: {{\n    {addition}')
            modified = True

    # 2. Fix nested role/user structure in mockResolvedValue
    content = re.sub(r"user: \{ isSystemAdmin: false \}, user: \{ isSystemAdmin: false \}", r"user: { isSystemAdmin: false }", content)
    
    # 3. Add user: { isSystemAdmin: false } to ANY object that looks like a Member in findFirst
    # We look for prisma.member.findFirst).mockResolvedValue({ ... })
    # This is complex because of nested objects. 
    # Let's try to match blocks starting with vi.mocked(prisma.member.findFirst).mockResolvedValue({
    # and ending with }) or as any)
    
    def inject_to_member(match):
        inner = match.group(1)
        if "isSystemAdmin" in inner:
            return match.group(0)
        # Try to insert before the last closing brace of the main object
        # This is naive but often works for simple flat mocks
        if inner.strip().endswith('}'):
             return f"vi.mocked(prisma.member.findFirst).mockResolvedValue({{{inner}, user: {{ isSystemAdmin: false }} }})"
        return match.group(0)

    # Simplified attempt: search for club: { ... } inside member findFirst and add user: { isSystemAdmin: false }
    # This covers many of our cases.
    content = re.sub(r"(vi\.mocked\(prisma\.member\.findFirst\)\.mockResolvedValue\(\{.*?)(id: '.*?'|userId: '.*?')(.*?\})\s*as any\)", 
                     r"\1\2\3, user: { isSystemAdmin: false } } as any)", content, flags=re.DOTALL)

    # Fallback for role-based ones
    def add_system_admin_role(match):
        role_part = match.group(0)
        if "isSystemAdmin" in role_part:
            return role_part
        return role_part.replace(f"role: '{match.group(1)}'", f"role: '{match.group(1)}', user: {{ isSystemAdmin: false }}")

    content = re.sub(r"role: '([^']*)'", add_system_admin_role, content)

    if modified or True:
        with open(filepath, 'w') as f:
            f.write(content)

for root, dirs, files in os.walk('apps/api/src/http/routes'):
    for file in files:
        if file.endswith('.spec.ts'):
            update_file(os.path.join(root, file))
