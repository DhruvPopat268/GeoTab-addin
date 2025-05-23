let body = document.getElementsByTagName('body')[0];
import icon from '../images/Font_Awesome_5_solid_chevron-left.svg';
import xIcon from '../images/close-round.svg';
import addinIcon from '../../app/images/icon.svg';
import '../styles/styleGuide.css'
let loginExample = `

    <link rel="stylesheet" href="https://my.geotab.com/geotab/checkmate/main.css?skin=my_geotab">

<style>
    body {
        height: initial;
        width: initial;
    }

    body.nightMode {
        background: #515964;
    }

    body>div {
        margin: 1em;
    }

    button:focus, #navigationId:focus {
        outline: none;
    }

    #prayoshaAddIn {
        width: initial;
    }

    #hiddenMenu {
        position: absolute;
        display: none;
        top: 0;
        left: 249px;
        min-width: 200px;
        height: auto;
    }

    .geotabIcons_chevron {
        mask-image: url(${icon});
        mask-repeat: no-repeat;
        -webkit-mask-image: url(${icon});
        -webkit-mask-repeat: no-repeat;
        background-color: #25477b;
    }

    .dev-dialog {
        
        border: 1px solid rgba(0, 0, 0, 0.3);
        border-radius: 6px;
        box-shadow: 0 3px 7px rgba(0, 0, 0, 0.3);
    }

    .dev-dialog::backdrop {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.8);
    }

    .dev-header {
        display: flex;
        background-color: #eee;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: flex-end;
        border-bottom: 1px solid #ccc;
    }

    .group-toggle-button svg {
        mask-image: url(${icon});
        mask-repeat: no-repeat;
        -webkit-mask-image: url(${icon});
        -webkit-mask-repeat: no-repeat;
        background-color: #666;
        transform: rotate(-90deg);
    }

    .group-wrapper {
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        flex: 1;
        padding-left: 40px;
    }

    #group-selector {
        display: flex;
        position: relative;
        z-index: 10003;
        margin: 0.5em 0;
    }

    #group-input {
        border: none;
        z-index: 10003;
        text-decoration: none;
    }

    #group-input:focus {
        outline-style: none;
    }

    #group-input::placeholder {
        font-weight: bold;
        text-decoration: none;
    }

    #active-group {
        padding: 5px 10px;
        margin: 0.5em 0.5em 0.5em 0;
        font-weight: bold;
        color: #666;
    }

    .navButton {
        display: block;
    }

    .select-buttons {
        list-style-type: none;
        padding: 0;
    }

    .select-buttons li {
        margin: 3px 10px 0px 10px;
    }

    #group-dropdown {
        display: none;
        position: absolute;
        top: 40px;
        width: 250px;
        z-index: 10003;
        min-height: auto;
        max-height: 80vh;
        overflow-y: auto;
        border: 1px solid #ccc;
    }

    #group-remove-all {
        padding: 5px 10px;
        display: none;
        border: none;
        width: 20px;
        height: 20px;
        cursor: pointer;
        margin: 0.5em 0.5em 0.5em 0;
    }

    #group-remove-all:focus {
        outline: none;
    }

    #group-remove-all svg {
        mask-image: url(${xIcon});
        mask-repeat: no-repeat;
        -webkit-mask-image: url(${xIcon});
        -webkit-mask-repeat: no-repeat;
        background-color: #666;
    }

    .dev-button {
        padding: 5px 10px;
        display: inline;
        background: #bbb repeat-x bottom;
        border: none;
        color: #fff;
        cursor: pointer;
        font-weight: bold;
        border-radius: 5px;
        -moz-border-radius: 5px;
        -webkit-border-radius: 5px;
        text-shadow: 1px 1px #666;
        text-decoration: none;
        margin: 0.5em 0.5em 0.5em 0;
    }

    .dev-button:hover {
        background-position: 0 -48px;
        filter: brightness(108%);
    }

    .dev-button:active {
        background-position: 0 top;
        position: relative;
        top: 1px;
        padding: 6px 10px 4px;
    }

    .dev-toggle {
        flex: auto;
        padding: 12px 10px;
    }

    .dev-form {
        flex-direction: column;
        flex-wrap: wrap;
        justify-content: flex-end;
        display: flex;
    }

    .dev-form label {
        display: none;
    }

    .dev-form input,
    .dev-form select {
        border-radius: 0.5em;
        padding: 0.5em;
    }

    .dev-form input {
        border-radius: 0.5em;
        padding: 0.5em;
    }

    .dev-form .line {
        display: block;
        margin: 0.5em 0;
    }

    .geotabIcons_prayoshaAddIn {
        background-image: url("${addinIcon}");
    } 
    </style>
    <header class="dev-header">
    
        <div id="group-wrapper" class="group-wrapper">
            <div id="group-selector" class="geotabFormEditField noTranslate">
                <input type="text" id="group-input" placeholder="Search for Groups">
            </div>
            <button id="group-toggle-button" class="dev-button group-toggle-button">
                <svg class="svgIcon geotabIcons_chevron" style="height: 15px; width: 15px;"></svg>
            </button>
            <div id="active-group">
                Active Groups: All
                </div>
            <button id="group-remove-all">
                <svg class="svgIcon" style="height: 15px; width: 15px"></svg>
            </button>
            <div id="group-dropdown" class="geotabPrimaryFill">
                <button id="open-filter-button" class="geo-form organization-filter-popup__item organization-filter-advanced-link">
                    <span class="organization-filter-advanced-link__label">Advanced group filter</span>
                </button>
                <div id="filter-dropdown" class="geotabPrimaryFill"></div>
            </div>
        </div>
        <div id="languages-target"></div>
        
        <a id="toggleBtn" class="dev-button">Blur add-in</a>
        
      
      <a target="_blank" href="https://geotab.github.io/sdk/software/guides/developing-addins/addin-icon-validator.html" class="dev-button">SVG Icon Validor</a>
      <a id="logoutBtn" class="dev-button">Logout</a>
    </header>

    <dialog id="loginDialog" class="dev-dialog">
        <form class="dev-form">
            <div class="line">
                <label for="email">Email</label>
                <input type="text" id="email" placeholder="Email">
            </div>
            <div class="line">
                <label for="password">Password</label>
                <input type="password" id="password" placeholder="Password">
            </div>
            <div class="line">
                <label for="server">Server</label>
                <input type="text" id="server" placeholder="Server URL (my.geotab.com)">
            </div>
            <div class="line">
                <label for="database">Database</label>
                <input type="text" id="database" placeholder="Database">
            </div>
            <div class="line error" id="loginError" style="display: none; color: red">
                Invalid User or Password
            </div>
            <div class="line">
                <a href="" id="loginBtn" class="dev-button">Login</a>
            </div>
        </form>
    </dialog>
    <dialog id="deviceDialog" class="dev-dialog">
        <form class="dev-form">
            <div class="line">
                <label for="devices">Device</label>
                <select id="devices"></select>
            </div>
            <div class="line">
                <a href="" id="okBtn" class="dev-button">OK</a>
            </div>
        </form>
    </dialog>
`;
body.innerHTML = loginExample + body.innerHTML;
