import { z } from 'zod';
console.log('flattenError:', (z as any).flattenError);
console.log('ZodError.prototype.flatten:', z.ZodError.prototype.flatten);
