import * as g from 'graphql';
import ListSection from '../ListSection';
const listResolver = () => ({
    check: (t) => g.isListType(t),
    Section: ListSection,
});
export default listResolver;
//# sourceMappingURL=listResolver.js.map