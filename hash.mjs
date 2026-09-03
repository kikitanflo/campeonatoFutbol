import bcrypt from 'bcryptjs';
const hash = bcrypt.hashSync('admin123', 10);
console.log('NUEVO HASH:', hash);
