import { UserLogoutData } from '../util/ApteanSSOProvider';
import { SLO_LOCALSTORAGE_ID } from '../util/Constants';

const FrontChannelLogOut: React.FC = () => {
  const goToHomePage = () => {
    window.location.href = '/';
  };

  const urlParams = new URLSearchParams(window.location.search);
  //if sid is present in the url, then save the logout data in local storage
  if (urlParams.has('sid')) {
    const userData: UserLogoutData = { sid: urlParams.get('sid') as string, iss: urlParams.get('iss') as string };
    const stringifiedUserData = JSON.stringify(userData);
    localStorage.setItem(SLO_LOCALSTORAGE_ID, stringifiedUserData);
    // need to dispatch the event to trigger the logout
    window.dispatchEvent(new StorageEvent('storage', { key: SLO_LOCALSTORAGE_ID, newValue: stringifiedUserData }));
  }

  return (
    <div>
      <h1>Thanks for using Aptean Merchant Portal.</h1>
      <p>You are now logged out.</p>
      <p onClick={goToHomePage}>Please click here to log back in</p>
    </div>
  );
};

export default FrontChannelLogOut;
