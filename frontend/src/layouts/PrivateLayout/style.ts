import styled from 'styled-components';

export default styled.div`
  .windowView {
    height: 100vh;
  }
  .mainView {
    height: 100vh;
    overflow: hidden;
    transition: all 0.2s;
    background: #f5f7fa;
  }
  .clickable {
    cursor: pointer;
  }
  .header {
    padding: 0 24px 0 12px !important;
  }
  .logo {
    height: 32px;
    width: 32px;
    /* background: rgba(0, 0, 0, 0.2); */
    background-image: url('/static/images/facebook.png');

    margin: 16px;
    background-size: cover;
  }
  .sidebar {
    height: 100vh;
    left: 0;background: #fff;
    border-right: 1px solid #e8e8e8;
  }
  .top-nav {
    background-color: #d6e4ea;
    display: flex;
    justify-content: space-between;
    font-weight: 500;
    .tab-selection {
      line-height: 20px;
      margin-top: 20px;
      .tab-item {
        padding: 8px 30px;
        &:active,
        :focus {
          background-color: #fff;
          border-top-left-radius: 3px;
          border-top-right-radius: 3px;
        }
        &:hover {
          background-color: #f2f6fa;
          border-top-left-radius: 3px;
          border-top-right-radius: 3px;
        }
      }
      .active {
        background-color: #fff;
        border-top-left-radius: 3px;
        border-top-right-radius: 3px;
      }
    }

    .tab-user {
      .user-item {
        padding: 8px 20px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        font-size: 20px;
      }
    }
  }
`;
