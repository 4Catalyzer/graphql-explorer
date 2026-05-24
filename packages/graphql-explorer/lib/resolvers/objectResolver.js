import * as g from 'graphql';
import ObjectSection from '../ObjectSection';
const objectResolver = () => ({
    check: (t) => g.isObjectType(t),
    Section: ObjectSection,
});
export default objectResolver;
//# sourceMappingURL=objectResolver.js.map