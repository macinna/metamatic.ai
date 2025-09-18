// Moved from src/PasswordlessSignUp.tsx
import React, { useState } from 'react';
import { signUp, confirmSignUp, type SignUpOutput } from 'aws-amplify/auth';

interface PasswordlessSignUpProps {
	onSignUpComplete: () => void;
}

export function PasswordlessSignUp({ onSignUpComplete }: PasswordlessSignUpProps) {
	const [email, setEmail] = useState('');
	const [confirmationCode, setConfirmationCode] = useState('');
	const [isAwaitingConfirmation, setIsAwaitingConfirmation] = useState(false);
	const [isSignUpComplete, setIsSignUpComplete] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const handleSignUp = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!email) {
			setError('Email is required');
			return;
		}

		setLoading(true);
		setError('');

		try {
			const { nextStep }: SignUpOutput = await signUp({
				username: email,
				password: 'Dummypassword123!',
				options: { userAttributes: { email: email } }
			});

			if (nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
				setIsAwaitingConfirmation(true);
			}
		} catch (err: any) {
			setError(err.message || 'Failed to sign up');
		} finally {
			setLoading(false);
		}
	};

	const handleConfirmSignUp = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!confirmationCode) {
			setError('Confirmation code is required');
			return;
		}

		setLoading(true);
		setError('');

		try {
			console.log('Confirming sign up for:', email);
			await confirmSignUp({ username: email, confirmationCode });
			setIsSignUpComplete(true);
			setTimeout(() => {
				onSignUpComplete();
			}, 2000);
		} catch (err: any) {
			console.error('Sign up confirmation error:', err);
			setError(err.message || 'Failed to confirm sign up');
		} finally {
			setLoading(false);
		}
	};

	if (isSignUpComplete) {
		return (
			<div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px', textAlign: 'center' }}>
				<h2>✅ Account Created Successfully!</h2>
				<p>Your account has been created and verified.</p>
				<p>Redirecting you to sign in...</p>
			</div>
		);
	}

	if (isAwaitingConfirmation) {
		return (
			<div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
				<h2>Confirm Your Email</h2>
				<p>We've sent a verification code to <strong>{email}</strong></p>
				<form onSubmit={handleConfirmSignUp}>
					<div style={{ marginBottom: '15px' }}>
						<label htmlFor="confirmationCode" style={{ display: 'block', marginBottom: '5px' }}>
							Verification Code:
						</label>
						<input
							id="confirmationCode"
							type="text"
							value={confirmationCode}
							onChange={(e) => setConfirmationCode(e.target.value)}
							placeholder="Enter the 6-digit code"
							style={{
								width: '100%',
								padding: '10px',
								fontSize: '16px',
								border: '1px solid #ddd',
								borderRadius: '4px'
							}}
							disabled={loading}
						/>
					</div>
					{error && (
						<div style={{
							color: 'red',
							marginBottom: '15px',
							padding: '10px',
							backgroundColor: '#fee',
							borderRadius: '4px'
						}}>
							{error}
						</div>
					)}
					<button
						type="submit"
						disabled={loading || !confirmationCode}
						style={{
							width: '100%',
							padding: '12px',
							fontSize: '16px',
							backgroundColor: loading ? '#ccc' : '#007bff',
							color: 'white',
							border: 'none',
							borderRadius: '4px',
							cursor: loading ? 'not-allowed' : 'pointer'
						}}
					>
						{loading ? 'Confirming...' : 'Confirm Email'}
					</button>
				</form>
				<button
					onClick={() => {
						setIsAwaitingConfirmation(false);
						setConfirmationCode('');
						setError('');
					}}
					style={{
						width: '100%',
						padding: '10px',
						fontSize: '14px',
						backgroundColor: 'transparent',
						color: '#007bff',
						border: '1px solid #007bff',
						borderRadius: '4px',
						cursor: 'pointer',
						marginTop: '10px'
					}}
				>
					Back to Email Entry
				</button>
			</div>
		);
	}

	return (
		<div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
			<h2>Sign Up</h2>
			<p>Enter your email to create an account. We'll send you a verification code.</p>
			<form onSubmit={handleSignUp}>
				<div style={{ marginBottom: '15px' }}>
					<label htmlFor="email" style={{ display: 'block', marginBottom: '5px' }}>
						Email:
					</label>
					<input
						id="email"
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						placeholder="Enter your email"
						style={{
							width: '100%',
							padding: '10px',
							fontSize: '16px',
							border: '1px solid #ddd',
							borderRadius: '4px'
						}}
						disabled={loading}
					/>
				</div>
				{error && (
					<div style={{
						color: 'red',
						marginBottom: '15px',
						padding: '10px',
						backgroundColor: '#fee',
						borderRadius: '4px'
					}}>
						{error}
					</div>
				)}
				<button
					type="submit"
					disabled={loading || !email}
					style={{
						width: '100%',
						padding: '12px',
						fontSize: '16px',
						backgroundColor: loading ? '#ccc' : '#28a745',
						color: 'white',
						border: 'none',
						borderRadius: '4px',
						cursor: loading ? 'not-allowed' : 'pointer'
					}}
				>
					{loading ? 'Sending Code...' : 'Sign Up'}
				</button>
			</form>
		</div>
	);
}