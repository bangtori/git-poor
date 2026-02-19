/**
 * 모달과 관련된 공통 타입을 정의합니다.
 */

export interface ModalActionProps {
  /** 모달 열림 여부 */
  isOpen: boolean;
  /** 모달 닫기 핸들러 */
  onClose: () => void;
  /**
   * 작업 성공 시 부모에게 알리기 위한 콜백 (예: 목록 새로고침)
   * @default undefined
   */
  onSuccess?: () => void;
}
