import express from 'express';
import cors from 'cors';
import routes from './routes';
import { globalErrorHandler } from './utils/error';

const app = express();

app.use(cors());
app.use(express.json());

// 注册路由
app.use('/api', routes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 全局错误处理中间件 (必须放在所有路由之后)
app.use(globalErrorHandler);

export default app;
