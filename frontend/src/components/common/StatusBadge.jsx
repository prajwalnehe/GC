import { getStatusColor } from '../../utils/helpers';

const StatusBadge = ({ status }) => (
  <span className={`badge ${getStatusColor(status)}`}>{status}</span>
);

export default StatusBadge;
