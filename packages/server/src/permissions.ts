import type { AuthContext } from './auth.js';

export type PermissionOp = 'read' | 'write' | 'delete';

/**
 * Row-level permission hook. Return false to reject the operation for that
 * row: writes are rejected per-mutation in push, reads are filtered out of pull.
 */
export type RowPermissionHook = (
	ctx: AuthContext,
	table: string,
	rowId: string,
	op: PermissionOp
) => Promise<boolean> | boolean;

/** Default policy: authenticated identities may read/write every row. */
export const allowAll: RowPermissionHook = () => true;

/**
 * Single-tenant helper: restrict every table to one user id.
 * Useful for "my data only" apps without a full authorization layer.
 */
export function ownerOnly(expectedUserId: string): RowPermissionHook {
	return (ctx) => ctx.userId === expectedUserId;
}

/**
 * Scope-based helper: writes (and deletes) require a scope in `writeScopes`,
 * reads require a scope in `readScopes`. An empty scope array never grants access.
 */
export function scopedAccess(options: { readScopes: string[]; writeScopes: string[] }): RowPermissionHook {
	return (ctx, _table, _rowId, op) => {
		const needed = op === 'read' ? options.readScopes : options.writeScopes;
		return needed.length > 0 && needed.every((scope) => ctx.scopes.includes(scope));
	};
}
