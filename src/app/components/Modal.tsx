import React, { ReactNode, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', handleEscape);
      
      const previouslyFocusedElement = document.activeElement as HTMLElement;
      modalRef.current?.focus();

      return () => {
        document.removeEventListener('keydown', handleEscape);
        previouslyFocusedElement?.focus();
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      ref={modalRef}
      tabIndex={-1}
    >
      <div className="modal-content">
        {title && <h2 id="modal-title">{title}</h2>}
        {children}
        <button className='border-2 border-black text-blck px-4 mt-3 py-2 rounded-lg' onClick={onClose} aria-label="Close modal">
          Close
        </button>
      </div>
      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .modal-content {
          background: white;
          padding: 20px;
          margin: auto 15px;
          border-radius: 5px;
        }
      `}</style>
    </div>,
    document.body
  );
};

export default Modal;











//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// // components/Modal.tsx
// import React, { ReactNode } from 'react';
// import ReactDOM from 'react-dom';

// interface ModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   children: ReactNode;
// }

// const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
//   if (!isOpen) return null;

//   // Ensure the modal is rendered in a portal (outside of the normal DOM tree)
//   return ReactDOM.createPortal(
//     <div className="modal-overlay">
//       <div className="modal-content">
//         {children}
//         <button onClick={onClose}>Close</button>
//       </div>
//       <style jsx>{`
//         .modal-overlay {
//           position: fixed;
//           top: 0;
//           left: 0;
//           right: 0;
//           bottom: 0;
//           background-color: rgba(0, 0, 0, 0.7);
//           display: flex;
//           justify-content: center;
//           align-items: center;
//         }
//         .modal-content {
//           background: white;
//           padding: 20px;
//           border-radius: 5px;
//         }
//       `}</style>
//     </div>,
//     document.body // Mounts the modal at the root of the DOM
//   );
// };

// export default Modal;
