import { Fragment, h } from 'preact';
import { useState } from 'preact/hooks';
import { BaseScreen } from '../components/BaseScreen';
import { API_SERVICE } from '../services/APIService';
import { useStateRef } from '../utils/hooks';

const LoginPage = (props: {}) => {
	let email = useStateRef("");
	let code = useStateRef("");
	let emailSent = useStateRef(false);

	const onLogin = async () => {
		if (emailSent.get()) {
			try {
				await API_SERVICE.doPOST("/login/magiclink/login", {email: email.get(), code: code.get()})
				emailSent.set(true);
				alert("Logged in");
			} catch (e) {
				alert(e);
			}
		} else {
			try {
				await API_SERVICE.doPOST("/login/magiclink/init", {email: email.get()})
				emailSent.set(true);
				alert("Email with code sent");
			} catch (e) {
				alert(e);
			}
		}
	}

	return (
		<BaseScreen selected='settings'>
			<h1>Login</h1>
			<p>
				Email:
				<input type="text" value={email.get()} onChange={e => email.set(e.currentTarget.value)} />
			</p>
			{emailSent.get() && <>
				<p>
					Code:
					<input type="text" value={code.get()} onChange={e => code.set(e.currentTarget.value)} />
				</p>
			</>}
			<button onClick={onLogin}>
				{emailSent.get() ? "Login" : "Send email code"}
			</button>
		</BaseScreen>
	);
};

export default LoginPage;