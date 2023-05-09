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
    sendTransaction,
    setOnAccountsChangedListener,
} from "./web3/web3-utils";

function App() {
    const [account, setAccount] = React.useState(undefined);

    React.useEffect(() => {
        const setup = async () => {
            const onAccountsChanged = accounts => {
                setAccount(accounts[0]);
            };

            const connectedAccount = await getConnectedAccount();
            setOnAccountsChangedListener(onAccountsChanged);
            setAccount(connectedAccount);
        };

        setup();
    }, []);

    const connect = async () => {
        const newAccount = await connectWallet();
        setAccount(newAccount);
    };

    const sendTx = async tx => {
        const response = await sendTransaction(tx);

        if (!response.success) {
            alert(response.error);
        }
    };

    return (
        <>
            <Router>
                <Header account={account} connect={connect} />
                <Switch>
                    <Route exact path="/">
                        <Dashboard sendTx={sendTx} />
                    </Route>
                    <Route exact path="/transactions">
                        <Transactions />
                    </Route>
                    <Route exact path="/settings">
                        <Settings />
                    </Route>
                    <Route exact path="/recovery-stats">
                        <RecoveryStats />
                    </Route>
                    <Route exact path="/recovery-history">
                        <RecoveryHistory />
                    </Route>
                </Switch>
                <Footer />
                <ChainChange account={account} />
            </Router>
        </>
    );
}

export default App;
