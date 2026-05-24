import ScalarSection from '../ScalarSection';
const scalarResolver = (config) => ({
    check: (t) => config.queryBuilder.isScalarType(t),
    Section: ScalarSection,
});
export default scalarResolver;
//# sourceMappingURL=scalarResolver.js.map