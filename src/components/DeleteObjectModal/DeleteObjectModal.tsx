import { FC } from 'react';
import { Button, Modal } from 'react-bootstrap';

export type DeleteObjectModalProps = {
  show: boolean;
  objectTitle: string;
  onClose?: () => void;
  onSubmit?: () => void;
};

export const DeleteObjectModal: FC<DeleteObjectModalProps> = ({ show, onClose, objectTitle, onSubmit }) => (
  <Modal
    show={show}
    backdrop={false}
    onHide={onClose}
  >
    <Modal.Header closeButton>
      <Modal.Title>
        Вы действительно хотите удалить
        {` ${objectTitle}`}
        ?
      </Modal.Title>
    </Modal.Header>
    <Modal.Body />
    <Modal.Footer>
      <Button
        variant="primary"
        onClick={onSubmit}
      >
        Удалить
      </Button>
      <Button
        variant="secondary"
        onClick={onClose}
      >
        Отмена
      </Button>
    </Modal.Footer>
  </Modal>
);
