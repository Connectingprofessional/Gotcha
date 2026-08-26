/**
 * Kysely dialect for Better Auth over Neon's HTTP serverless driver.
 *
 * Unlike the PostgreSQL Pool/WebSocket path, this uses fetch-based HTTP queries
 * and is safe for Cloudflare Workers where raw TCP and reusable sockets are not
 * available.
 */
import { neon } from "@neondatabase/serverless";
import {
  type DatabaseConnection,
  type DatabaseIntrospector,
  type Dialect,
  type Driver,
  type Kysely,
  PostgresAdapter,
  PostgresIntrospector,
  PostgresQueryCompiler,
  type QueryCompiler,
  type QueryResult,
} from "kysely";
import { NeonDialect } from "kysely-neon";

/**
 * Build the Kysely dialect used by Better Auth in production.
 * `kysely-neon` delegates queries to Neon's HTTP driver.
 */
export function neonDialect(databaseUrl: string): Dialect {
  return new NeonDialect({ neon: neon(databaseUrl) }) as unknown as Dialect;
}
