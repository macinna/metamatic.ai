// Moved from src/PasswordlessAuth.tsx
import React, { useState } from 'react';
import { useAuth } from '../providers/AuthProvider';
import { PasswordlessSignUp } from './PasswordlessSignUp';
import { PasswordlessSignIn } from './PasswordlessSignIn';

interface PasswordlessAuthProps {
	children: React.ReactNode;
}

export function PasswordlessAuth({ children }: PasswordlessAuthProps) {
	const [showSignIn, setShowSignIn] = useState(true);
	const [showSignUp, setShowSignUp] = useState(false);
	const { user, loading } = useAuth();

	const handleSignUpComplete = () => {
		setShowSignUp(false);
		setShowSignIn(true);
	};

	const handleSignInSuccess = async () => {
		// AuthProvider hub listener will update user automatically
		await new Promise(resolve => setTimeout(resolve, 50));
	};

	if (loading) {
		return (
			<div style={{ 
				display: 'flex', 
				justifyContent: 'center', 
				alignItems: 'center', 
				minHeight: '100vh' 
			}}>
				Loading...
			</div>
		);
	}

	if (user) {
		return <>{children}</>;
	}

	if (showSignIn) {
		return (
			<PasswordlessSignIn
				onSignInSuccess={handleSignInSuccess}
				onSwitchToSignUp={() => {
					setShowSignIn(false);
					setShowSignUp(true);
				}}
			/>
		);
	}

	if (showSignUp) {
		return (
			<div>
				<PasswordlessSignUp onSignUpComplete={handleSignUpComplete} />
				<div style={{ textAlign: 'center', marginTop: '20px' }}>
					<p>Already have an account?</p>
					<button
						onClick={() => {
							setShowSignUp(false);
							setShowSignIn(true);
						}}
						style={{
							background: 'none',
							border: 'none',
							color: '#007bff',
							textDecoration: 'underline',
							cursor: 'pointer',
							fontSize: '16px'
						}}
					>
						Sign in here
					</button>
				</div>
			</div>
		);
	}

	return (
		<div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px', textAlign: 'center' }}>
			<h1>Hi, welcome to Metamatic</h1>
			<p>Please sign in to continue.</p>
			<button
				onClick={() => setShowSignIn(true)}
				style={{
					padding: '12px 24px',
					fontSize: '16px',
					backgroundColor: '#007bff',
					color: 'white',
					border: 'none',
					borderRadius: '4px',
					cursor: 'pointer',
					marginBottom: '10px'
				}}
			>
				Sign In
			</button>
		</div>
	);
}