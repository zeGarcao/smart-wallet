import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import "./css/App.css";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Settings from "./pages/Settings";
import RecoveryStats from "./pages/RecoveryStats";
import RecoveryHistory from "./pages/RecoveryHistory";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ChainChange from "./components/ChainChange";
import {
    connectWallet,
    getConnectedAccount,
    setOnAccountsChangedListener,
} from "./web3/web3-utils";
import Loader from "./components/Loader";

function App() {
    const [account, setAccount] = React.useState(undefined);
    const [isLoading, setIsLoading] = React.useState(false);

    React.useEffect(() => {
        const setup = async () => {
            showLoading();
            const onAccountsChanged = accounts => {
                showLoading();
                setAccount(accounts[0]);
                hideLoading();
            };

            const connectedAccount = await getConnectedAccount();
            setOnAccountsChangedListener(onAccountsChanged);
            setAccount(connectedAccount);
            hideLoading();
        };

        setup();
    }, []);

    const connect = async () => {
        showLoading();
        const newAccount = await connectWallet();
        setAccount(newAccount);
        hideLoading();
    };

    const showLoading = () => {
        setIsLoading(true);
    };
    const hideLoading = () => {
        setIsLoading(false);
    };

    return (
        <>
            <Router>
                <Header account={account} connect={connect} />
                <Switch>
                    <Route exact path="/">
                        <Dashboard
                            showLoading={showLoading}
                            hideLoading={hideLoading}
                        />
                    </Route>
                    <Route exact path="/transactions">
                        <Transactions
                            showLoading={showLoading}
                            hideLoading={hideLoading}
                        />
                    </Route>
                    <Route exact path="/settings">
                        <Settings
                            showLoading={showLoading}
                            hideLoading={hideLoading}
                        />
                    </Route>
                    <Route exact path="/recovery-stats">
                        <RecoveryStats
                            showLoading={showLoading}
                            hideLoading={hideLoading}
                        />
                    </Route>
                    <Route exact path="/recovery-history">
                        <RecoveryHistory
                            showLoading={showLoading}
                            hideLoading={hideLoading}
                        />
                    </Route>
                </Switch>
                <Footer />
                <ChainChange account={account} />
                <Loader isLoading={isLoading} />
            </Router>
        </>
    );
}

export default App;
