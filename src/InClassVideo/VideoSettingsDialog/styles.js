import styled from "styled-components";

export const StyledVideoSettingsDialog = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  max-height: calc(100% - 32px);
  border-radius: 4px;
  max-width: 960px;
  border: 1px solid;

  .settings-video {
    width: 100%;
    background-color: black;
    height: 400px;
    margin: 0;
    transform: rotateY(180deg);
  }

  .close-modal-icon {
    position: absolute;
    top: 15px;
    right: 15px;
    cursor: pointer;
  }

  .dialog-backdrop {
    background-color: rgba(0, 0, 0, 0.8);
  }

  .dialog-inner {
    background-color: #fff;
    position: relative;
    z-index: 2;

    min-width: 600px;

    min-height: 400px;
  }

  .dialog-header {
    height: 72px;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #00b5ce;
    padding: 0 0 0 27px;
    .dialog-title {
      font-size: 32px;
      line-height: 36px;
    }
    .dialog-close {
      padding: 21px 21px;
    }
  }

  .dialog-body {
    display: flex;
    flex-direction: column;
    align-items: center;
    max-height: calc(100% - 32px);
    border-radius: 8px;
    max-width: 92vw;
    min-width: 280px;
  }

  .select-menu-root {
    max-width: 100%;
  }
`;
