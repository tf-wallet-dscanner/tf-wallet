import classNames from 'classnames';
import { useRef, useState } from 'react';
import { AiOutlineCheck } from 'react-icons/ai';
import { GiHamburgerMenu } from 'react-icons/gi';
import { useNavigate } from 'react-router-dom';
import { useClickAway } from 'react-use';

import './dropdown-menu.scss';

export default function DropdownMenu({ accounts, handleAccountChange }) {
  const navigation = useNavigate();
  const dropdownMenuRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  useClickAway(dropdownMenuRef, () => {
    setIsOpen(false);
  });

  const handleMenuOpen = () => {
    setIsOpen(true);
  };

  return (
    <div className="dropdown dropdown-end dropdown-menu">
      <div className="dropdown-menu__icon" onClick={handleMenuOpen}>
        <GiHamburgerMenu />
      </div>
      <ul
        ref={dropdownMenuRef}
        className={classNames('dropdown-menu__contents dropdown-content', {
          open: isOpen,
        })}
      >
        <li onClick={() => null}>
          <label htmlFor="dropdown-menu__account__modal">계정 변경</label>
        </li>
        <li onClick={() => navigation('/account-import')}>
          <span>계정 추가</span>
        </li>
        <li onClick={() => navigation('/account-export')}>
          <span>계정 내보내기</span>
        </li>
      </ul>

      <input
        type="checkbox"
        id="dropdown-menu__account__modal"
        className="modal-toggle"
      />
      <div className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg text-left">내 계정</h3>
          <hr className="mt-2 mb-4" />
          {accounts?.identities.map(({ address, name }) => (
            <div
              key={address}
              className="flex items-center text-lg cursor-pointer"
              onClick={() => handleAccountChange(address)}
            >
              {accounts?.selectedAddress === address ? (
                <AiOutlineCheck className="mr-2 text-[#51b778]" />
              ) : null}
              <label className="cursor-pointer">{name}</label>
            </div>
          ))}
          <div className="modal-action">
            <label htmlFor="dropdown-menu__account__modal" className="btn">
              닫기
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
