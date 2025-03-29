import { registerPlugin } from '@capacitor/core';
import type { DirectTcpClientPlugin } from './definitions';

const DirectTcpClient = registerPlugin<DirectTcpClientPlugin>('DirectTcpClient');

export * from './definitions';
export { DirectTcpClient };