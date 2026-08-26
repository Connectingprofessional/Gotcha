/**
 * Kysely dialect for Better Auth over Neon's HTTP serverless driver.
 *
 * Unlike the PostgreSQL Pool/WebSocket path, this uses fetch-based HTTP queries
 * and is safe for Cloudflare Workers where raw TCP and reusable sockets are not
 * available.
 */
import { neon } from "@neondatabase/serverless";
import type { Dialect } from "kysely";
import { NeonDialect } from "kysely-neon";

export function neonDialect(databaseUrl: string): Dialect {
  return new NeonDialect({ neon: neon(databaseUrl) }) as unknown as Dialect;
}
