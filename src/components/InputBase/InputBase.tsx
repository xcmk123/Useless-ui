/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  forwardRef,
  Fragment,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import useClickOutside from "../../core-hooks/useClickOutside";
import debounce from "../utils/debounce";
import "./InputBase.scss";
const InputBase = ({ children }: any) => {
  const [isVisible, setVisible] = useState<boolean>(false);
  const [isFocus, setFocus] = useState<boolean>(false);
  const [isTyping, setTyping] = useState<boolean>(false);
  const [inputValues, setInputValues] = useState<string | number>("");
  const menuRef = useRef<any>();

  function _onToggleField() {
    setFocus(false);
  }
  function _onMountMenu() {
    setFocus(true);
    setVisible(true);
  }

  function _onRemoveMenu() {
    setVisible(false);
  }

  const _debounce = useCallback(
    debounce(async function (value: string) {
      setTyping(false);
    }, 1000),
    []
  );

  function _onChangeField(e: any) {
    if (!isTyping) {
      setTyping(true);
    }
    setInputValues(e.target.value);
    _debounce(e.target.value);
  }

  useClickOutside(menuRef, _onToggleField);

  return (
    <div
      className="form container-menu"
      onClick={!isVisible ? _onMountMenu : () => {}}
      ref={menuRef}
    >
      <input
        type="text"
        id="email"
        className="form__input"
        autoComplete="off"
        placeholder=" "
        value={inputValues}
        onChange={_onChangeField}
        onBlur={_onRemoveMenu}
      />
      <label htmlFor="email" className="form__label">
        Email
      </label>
      {isVisible && (
        <MenuPopover
          isFocus={isFocus}
          isTyping={isTyping}
          ref={menuRef}
          _onToggleField={_onToggleField}
          _onRemoveMenu={_onRemoveMenu}
        >
          {children}
        </MenuPopover>
      )}
    </div>
  );
};

const MenuPopover = forwardRef(function (
  props: any,
  ref: React.Ref<HTMLDivElement>
) {
  const { isTyping, isFocus, LoadingComponent, children, _onRemoveMenu } =
    props;

  const [rect, setRect] = useState({
    top: 0,
    width: 0,
    left: 0,
  });

  function _onFinishAnimation() {
    if (!isFocus) return _onRemoveMenu();
  }

  function calcPositionMenu(ref: any) {
    const clientRect = ref.current.getBoundingClientRect();
    setRect({
      ...rect,
      width: clientRect.width,
      top: clientRect.top + 5 + clientRect.height,
      left: clientRect.left,
    });
  }

  useLayoutEffect(() => {
    calcPositionMenu(ref);
  }, []);
  /**
   * check body is exited...
   */
  const rootBody = document.querySelector("body");
  if (!rootBody) return <Fragment></Fragment>;
  /**
   * body is exited...
   */
  const { left, top, width } = rect;
  return createPortal(
    <div id="portal-overlay">
      <div className="container-menu">
        <div
          className={`popover-container ${isFocus ? "visible" : "hidden"}`}
          id="popover-container"
          onAnimationEnd={_onFinishAnimation}
          style={{
            maxHeight: 200,
            width: width,
            left: left,
            top: top,
          }}
        >
          {isTyping ? LoadingComponent : children}
        </div>
      </div>
    </div>,
    rootBody
  );
});

export default InputBase;
