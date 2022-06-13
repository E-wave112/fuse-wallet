/// utility function to exclude certain fields that should not be shown to the client
export const excludeFields = (
    fields: string[],
    objects: Record<any, unknown>,
): Record<any, unknown> => {
    const exclude = new Set(fields);
    const result = Object.fromEntries(
        Object.entries(objects).filter((e) => !exclude.has(e[0])),
    );
    return result;
};
