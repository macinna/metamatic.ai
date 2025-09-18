// Moved from src/PasswordlessSignIn.tsx
import React, { useState } from 'react';
import { signIn, confirmSignIn, type SignInOutput } from 'aws-amplify/auth';

interface PasswordlessSignInProps {
	onSignInSuccess: () => void;
	onSwitchToSignUp: () => void;
}

export function PasswordlessSignIn({ onSignInSuccess, onSwitchToSignUp }: PasswordlessSignInProps) {
	const [email, setEmail] = useState('');
	const [confirmationCode, setConfirmationCode] = useState('');
	const [isAwaitingConfirmation, setIsAwaitingConfirmation] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const handleSignIn = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!email) {
			setError('Email is required');
			return;
		}

		setLoading(true);
		setError('');

		try {
			console.log('Attempting sign in for:', email);
			const result: SignInOutput = await signIn({
				username: email,
				options: {
					authFlowType: 'USER_AUTH',
					preferredChallenge: 'EMAIL_OTP',
				},
			} as any);

			console.log('Sign in result:', result);

			const step = result.nextStep.signInStep as string;
			console.log('Next sign-in step:', step, result.nextStep);

			if (step === 'CONFIRM_SIGN_IN_WITH_EMAIL_CODE') {
				setIsAwaitingConfirmation(true);
				return;
			}

			if (
				step === 'CONTINUE_SIGN_IN_WITH_FIRST_FACTOR_SELECTION' ||
				step === 'CONTINUE_SIGN_IN_WITH_MFA_SELECTION'
			) {
				try {
					const cont = await confirmSignIn({ challengeResponse: 'EMAIL_OTP' });
					const contStep = cont.nextStep.signInStep as string;
						console.log('After selecting EMAIL_OTP, step:', contStep);
					if (contStep === 'CONFIRM_SIGN_IN_WITH_EMAIL_CODE') {
						setIsAwaitingConfirmation(true);
						return;
					}
					if (contStep === 'DONE') {
						onSignInSuccess();
						return;
					}
					setError(`Unexpected step after factor selection: ${contStep}`);
					return;
				} catch (e: any) {
					console.error('Error continuing sign-in with EMAIL_OTP:', e);
					const emsg = (e?.message || '').toLowerCase();
					if (emsg.includes('selected challenge is not available')) {
						setError('Email code sign-in isn\'t available for this address. Please sign up first.');
					} else {
						setError('Unable to continue with email code. Please sign up first.');
					}
					setIsAwaitingConfirmation(false);
					return;
				}
			}

			if (step === 'CONFIRM_SIGN_UP') {
				setError('Please confirm your email first, then sign in.');
				setIsAwaitingConfirmation(false);
				return;
			}

			if (step === 'RESET_PASSWORD') {
				setError('Password reset required. Please reset or sign up.');
				setIsAwaitingConfirmation(false);
				return;
			}

			if (step === 'DONE' && result.isSignedIn) {
				onSignInSuccess();
				return;
			}

			setError(`Unexpected sign-in step: ${step}`);
		} catch (err: any) {
			console.error('Sign in error:', err);
			const message = err?.message || 'Failed to send verification code';
			if (/User .* does not exist|UserNotFoundException/i.test(message)) {
				setError('If an account exists for this email, a code was sent.');
			} else if (/selected challenge is not available/i.test(message)) {
				setError('Email code sign-in isn\'t available for this address. Please sign up first.');
			} else {
				setError(message);
			}
		} finally {
			setLoading(false);
		}
	};

	const handleConfirmSignIn = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!confirmationCode) {
			setError('Confirmation code is required');
			return;
		}

		setLoading(true);
		setError('');

		try {
			console.log('Confirming sign in with code...');
			await confirmSignIn({
				challengeResponse: confirmationCode,
			});
			console.log('Sign in confirmed successfully');
			onSignInSuccess();
		} catch (err: any) {
			console.error('Confirm sign in error:', err);
			setError(err.message || 'Failed to confirm sign in');
		} finally {
			setLoading(false);
		}
	};

	if (isAwaitingConfirmation) {
		return (
			<div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
				<h2>Check Your Email</h2>
				<p>
					If an account exists for <strong>{email}</strong>, we've sent a verification code.
				</p>
				<form onSubmit={handleConfirmSignIn}>
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
						{loading ? 'Signing In...' : 'Sign In'}
					</button>
					<div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
						<button
							type="button"
							onClick={async () => {
								if (!email) return;
								setLoading(true);
								setError('');
								try {
									const retry = await signIn({
										username: email,
										options: { authFlowType: 'USER_AUTH', preferredChallenge: 'EMAIL_OTP' },
									} as any);
									const step = retry.nextStep.signInStep as string;
									if (step === 'CONFIRM_SIGN_IN_WITH_EMAIL_CODE') {
									} else if (
										step === 'CONTINUE_SIGN_IN_WITH_FIRST_FACTOR_SELECTION' ||
										step === 'CONTINUE_SIGN_IN_WITH_MFA_SELECTION'
									) {
										try {
											const cont = await confirmSignIn({ challengeResponse: 'EMAIL_OTP' });
											if ((cont.nextStep.signInStep as string) !== 'CONFIRM_SIGN_IN_WITH_EMAIL_CODE') {
												setError('Could not resend code. Please sign up first.');
											}
										} catch (e: any) {
											const emsg = (e?.message || '').toLowerCase();
											if (emsg.includes('selected challenge is not available')) {
												setError('Email code sign-in isn\'t available for this address. Please sign up first.');
											} else {
												setError('Unable to resend code. Please sign up first.');
											}
										}
									} else if (step === 'DONE' && retry.isSignedIn) {
										onSignInSuccess();
									} else {
										setError(`Unexpected sign-in step while resending: ${step}`);
									}
								} catch (e: any) {
									const message = e?.message || '';
									if (/selected challenge is not available/i.test(message)) {
										setError('Email code sign-in isn\'t available for this address. Please sign up first.');
									} else {
										setError('Unable to resend code.');
									}
								} finally {
									setLoading(false);
								}
							}}
							style={{
								flex: 1,
								padding: '10px',
								fontSize: '14px',
								backgroundColor: 'transparent',
								color: '#007bff',
								border: '1px solid #007bff',
								borderRadius: '4px',
								cursor: 'pointer'
							}}
						>
							Resend Code
						</button>
						<button
							type="button"
							onClick={() => {
								setIsAwaitingConfirmation(false);
								setConfirmationCode('');
								setError('');
								onSwitchToSignUp();
							}}
							style={{
								flex: 1,
								padding: '10px',
								fontSize: '14px',
								backgroundColor: 'transparent',
								color: '#28a745',
								border: '1px solid #28a745',
								borderRadius: '4px',
								cursor: 'pointer'
							}}
						>
							Sign Up Instead
						</button>
					</div>
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
			<h2>Sign In</h2>
			<p>Enter your email and we'll send you a verification code</p>
			<form onSubmit={handleSignIn}>
				<div style={{ marginBottom: '15px' }}>
					<label htmlFor="email" style={{ display: 'block', marginBottom: '5px' }}>
						Email:
					</label>
					<input
						id="email"
						type="email"
						value={email}
						onChange={(e) => {
							setEmail(e.target.value);
							if (error) setError('');
						}}
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
						backgroundColor: loading ? '#ccc' : '#007bff',
						color: 'white',
						border: 'none',
						borderRadius: '4px',
						cursor: loading ? 'not-allowed' : 'pointer'
					}}
				>
					{loading ? 'Sending Code...' : 'Sign In'}
				</button>
			</form>
			<div style={{ textAlign: 'center', marginTop: '20px' }}>
				<p>Don't have an account?</p>
				<button
					onClick={onSwitchToSignUp}
					style={{
						background: 'none',
						border: 'none',
						color: '#007bff',
						textDecoration: 'underline',
						cursor: 'pointer',
						fontSize: '16px'
					}}
				>
					Sign up here
				</button>
			</div>
		</div>
	);
}