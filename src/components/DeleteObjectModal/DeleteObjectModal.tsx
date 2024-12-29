import { FC } from 'react';
import { Modal } from 'react-bootstrap';
import { Button } from '../Button';
import styles from './DeleteObject.module.scss';

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
    className={styles.dlg_delete}
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
        background='blue'
        onClick={onSubmit}
      >
        Удалить
      </Button>
      <Button
        background='outlined-blue'
        onClick={onClose}
      >
        Отмена
      </Button>
    </Modal.Footer>
  </Modal>
);
