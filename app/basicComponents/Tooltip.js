// @flow
import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { tooltip } from '/assets/images';
import { smColors } from '/vars';

const Wrapper = styled.div`
  display: none;
  position: absolute;
  padding: 10px 15px;
  background-color: ${smColors.lightGray};
  border: 1px solid ${smColors.black};
  z-index: 10;
`;

const ToolTipIcon = styled.img`
  position: absolute;
  top: 2px;
  left: 2px;
  width: 13px;
  height: 13px;
`;

const Text = styled.div`
  font-size: 10px;
  line-height: 13px;
  text-transform: uppercase;
  color: ${smColors.black};
`;

type Props = {
  className?: string,
  text: string
};

class Tooltip extends PureComponent<Props> {
  render() {
    const { className, text } = this.props;
    return (
      <Wrapper className={className}>
        <ToolTipIcon src={tooltip} />
        <Text>{text}</Text>
      </Wrapper>
    );
  }
}

export default Tooltip;
