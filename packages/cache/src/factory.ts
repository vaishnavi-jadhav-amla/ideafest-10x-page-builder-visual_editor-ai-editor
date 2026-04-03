import { IIntegrator } from "./integrator";
import { cdnIntegrator } from "./cdn/cdn-integrator";
import { createFileIntegrator } from "./file/file-integrator";
import { createRedisIntegrator } from "./redis/redis-integrator";

export async function integrators(integrator?: IntegratorType): Promise<IIntegrator> {
  const type = (integrator ?? process.env.STORAGE)?.toUpperCase() as IntegratorType;
  const create = integratorMap[type];
  if (!create) throw new Error(`Unknown type: ${type}`);
  const instance = await create();
  return instance;
}

const integratorMap = {
  FILE: async () => await createFileIntegrator(),
  REDIS: async () => await createRedisIntegrator(),
  CDN: async () => await cdnIntegrator(),
};

type IntegratorType = "REDIS" | "FILE" | "CDN";
