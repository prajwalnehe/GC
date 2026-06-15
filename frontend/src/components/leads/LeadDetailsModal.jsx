import Modal from '../common/Modal';
import LeadDetailsPanel from './LeadDetailsPanel';

const LeadDetailsModal = ({ leadId, isOpen, onClose, onUpdated }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Lead Details" size="xl">
    {leadId && (
      <LeadDetailsPanel
        leadId={leadId}
        embedded
        onClose={onClose}
        onUpdated={onUpdated}
      />
    )}
  </Modal>
);

export default LeadDetailsModal;
