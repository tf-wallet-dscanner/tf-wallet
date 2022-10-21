import classNames from 'classnames';
import { memo, useMemo, useRef, useState } from 'react';
import { AiOutlineCheck } from 'react-icons/ai';
import { GiHamburgerMenu } from 'react-icons/gi';
import { GrFormClose } from 'react-icons/gr';
import { useNavigate } from 'react-router-dom';
import { useClickAway } from 'react-use';
import Box from 'ui/components/atoms/box';
import Typography from 'ui/components/atoms/typography';

import './dropdown-menu.scss';

function DropdownMenu({ accounts, handleAccountChange }) {
  const navigation = useNavigate();
  const dropdownMenuRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  useClickAway(dropdownMenuRef, () => {
    setIsOpen(false);
  });

  const handleMenuOpen = () => {
    setIsOpen(true);
  };

  const accounsList = useMemo(() => {
    return accounts?.identities?.map(({ address, name }) => (
      <Box
        key={address}
        className="flex items-center p-1 text-lg cursor-pointer"
        onClick={() => handleAccountChange(address)}
      >
        {accounts?.selectedAddress === address ? (
          <AiOutlineCheck className="mr-2 text-[#51b778]" />
        ) : (
          <Box className="invisible w-3 mr-2" />
        )}
        <Typography as="label" className="w-full !text-black cursor-pointer">
          {name}
        </Typography>
      </Box>
    ));
  }, [accounts]);

  return (
    <Box className="dropdown dropdown-end dropdown-menu">
      <Box className="dropdown-menu__icon" onClick={handleMenuOpen}>
        <GiHamburgerMenu />
      </Box>
      <ul
        ref={dropdownMenuRef}
        className={classNames('dropdown-menu__contents dropdown-content', {
          open: isOpen,
        })}
      >
        <Box as="li" onClick={() => null}>
          <Typography as="label" htmlFor="dropdown-menu__account__modal">
            계정 변경
          </Typography>
        </Box>
        <Box as="li" onClick={() => navigation('/import-account')}>
          <Typography>계정 추가</Typography>
        </Box>
        <Box as="li" onClick={() => navigation('/export-account')}>
          <Typography>계정 내보내기</Typography>
        </Box>
      </ul>

      <input
        type="checkbox"
        id="dropdown-menu__account__modal"
        className="modal-toggle"
      />
      <Box className="modal">
        <Box className="modal-box">
          <Box className="flex justify-between">
            <Typography
              as="h3"
              className="font-bold text-lg text-left !text-black"
            >
              내 계정
            </Typography>
            <Typography as="label" htmlFor="dropdown-menu__account__modal">
              <GrFormClose className="text-2xl cursor-pointer" />
            </Typography>
          </Box>
          <Box as="hr" className="mt-2 mb-4" />
          {accounsList}
        </Box>
      </Box>
    </Box>
  );
}

export default memo(DropdownMenu);
