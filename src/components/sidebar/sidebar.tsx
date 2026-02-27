import { prisma } from '@/lib/prisma';
import { SidebarContent } from './sidebar-content';

export const Sidebar = async () => {
  const prompts = await prisma.prompt.findMany();
  console.log(prompts);
  return <SidebarContent prompts={prompts} />;
};
