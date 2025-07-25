import express, { Request, Response } from 'express';

const app = express();
const PORT = process.env.PORT || 5000;

app.get('/', (req: Request, res: Response) => {
 res.json({ message: 'Hello from MERN backend!' });
});

app.listen(PORT, () => {
 console.log(`Server running on port ${PORT}`);
});