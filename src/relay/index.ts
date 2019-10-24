import config from '../config';
import ConnectionPanel from './ConnectionPanel';
import ConnectionQueryBuilder from './ConnectionQueryBuilder';
import NodeQueryBuilder from './NodeQueryBuilder';

export default function addRelayTypes() {
  config.addRootQueryBuilder(NodeQueryBuilder);
  config.addFieldQueryBuilder(ConnectionQueryBuilder);
  config.addPanel(ConnectionQueryBuilder, ConnectionPanel);
}
