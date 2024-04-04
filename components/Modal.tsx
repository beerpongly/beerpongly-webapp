import { useState, ReactNode } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children?: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  const [isVisible, setIsVisible] = useState(isOpen);

  const closeModal = () => {
    setIsVisible(false);
    onClose();
  };

  return (
    <>
      {isVisible && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div className="relative bg-white rounded-lg shadow-lg">
              <div className="flex justify-between items-center p-5">
                <h3 className="text-lg font-bold">Modal Title</h3>
                <button className="text-gray-700 hover:text-gray-900" onClick={closeModal}>
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="p-5">{children}</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Modal;
