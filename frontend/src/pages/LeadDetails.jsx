import { useParams } from 'react-router-dom';
import LeadDetailsPanel from '../components/leads/LeadDetailsPanel';

const LeadDetails = () => {
  const { id } = useParams();
  return <LeadDetailsPanel leadId={id} />;
};

export default LeadDetails;
