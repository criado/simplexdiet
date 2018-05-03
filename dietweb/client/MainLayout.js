import React from 'react';
import AccountsUIWrapper from './components/AccountsUIWrapper.jsx';

export const MainLayout = ({content, active}) => {
  return (
      <div className='container-fluid'>
        <div className="row" id="header-title">
          <a href="/" style={{"text-decoration":"inherit", "color": "inherit"}}><h1>
            Simplex diet <small>Beta</small>
            <AccountsUIWrapper/>
          </h1></a>
        </div>
        <div className="row">
        </div>
        <div className='row'>
          {content}
        </div>
      </div>

)}
