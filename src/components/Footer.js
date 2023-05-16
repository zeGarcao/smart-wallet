import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithubSquare, faLinkedin } from "@fortawesome/free-brands-svg-icons";

function Footer() {
    return (
        <footer>
            <div>
                made by <span className="author-ens">zegarcao.eth</span>
            </div>
            <div className="social">
                <a
                    href="https://github.com/zeGarcao/smart-wallet"
                    target="_blank">
                    <FontAwesomeIcon
                        icon={faGithubSquare}
                        className="social-icon"
                    />
                </a>{" "}
                <a
                    href="https://www.linkedin.com/in/jose-garcao"
                    target="_blank">
                    <FontAwesomeIcon
                        icon={faLinkedin}
                        className="social-icon"
                    />
                </a>
            </div>
        </footer>
    );
}

export default Footer;
