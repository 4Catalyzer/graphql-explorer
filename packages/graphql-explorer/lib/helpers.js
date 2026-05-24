export function isNode(type) {
    return !!type.getInterfaces().find((i) => i.name === 'Node');
}
//# sourceMappingURL=helpers.js.map