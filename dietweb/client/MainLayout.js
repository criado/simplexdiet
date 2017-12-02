import React from 'react';
import AccountsUIWrapper from './components/AccountsUIWrapper.jsx';

export const MainLayout = ({content, active}) => {
  return (
      <div className='container-fluid'>
        <div className="row" id="header-title">
          <h1>
            Simplex diet
            <AccountsUIWrapper/>
          </h1>
        </div>
        <div className="row">
          <Menu active={active}/>
        </div>
        <div className='row'>
          {content}
        </div>
      </div>

)}

class Menu extends React.Component {
  updateActive() {
    $("#menu").children().removeClass("active");
    $("#menu-"+this.props.active).addClass("active");
  }
  componentDidMount() {
    this.updateActive()
  }
  componentDidUpdate() {
    this.updateActive()
  }
  render() {
    return (
        <ul className="nav nav-pills nav-fill" id="menu">
          <li className="nav-item" id="menu-home"><a className="nav-link" href="/">Diet</a></li>
          <li className="nav-item" id="menu-pref"><a className="nav-link" href="/pref">Ingredients</a></li>
          <li className="nav-item" id="menu-profile"><a className="nav-link" href="/profile">Nutrients</a></li>
        </ul>
    )
  }
}

// let Nav = () => (
//   <nav className="navbar navbar-default">
//     <div className="container-fluid">
//       <div className="navbar-header">
//         <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
//           <span className="sr-only">Toggle navigation</span>
//           <span className="icon-bar"></span>
//           <span className="icon-bar"></span>
//           <span className="icon-bar"></span>
//         </button>
//         <a className="navbar-brand" href="#">Simplex Diet</a>
//       </div>
//       <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
//        <ul className="nav navbar-nav navbar-right">
//          <li id="user-login">
//            <AccountsUIWrapper />
//          </li>
//           <li>
//             <a href="https://github.com/guillefix/simplexdiet">
//               GitHub
//             </a>
//           </li>
//        </ul>
//       </div>
//     </div>
//   </nav>
// )
