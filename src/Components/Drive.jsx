import { Button, Grid, Paper, Typography } from '@mui/material';
import '../styles/drive.css';
import { ReactComponent as IconEmpty } from '../assets/empty.svg';
import { useEffect, useState } from 'react';
import useDrivePicker from 'react-google-drive-picker';
import { gapi, loadAuth2 } from 'gapi-script';

const Drive = () => {
	const [user, setUser] = useState(null);
	const [openPicker, data] = useDrivePicker();
	const [fileList, setFileList] = useState([]);

	useEffect(() => {
		// Updating signed in user after signing in
		const setAuth2 = async () => {
			const auth2 = await loadAuth2(gapi, process.env.REACT_APP_CLENT_ID, '');
			if (auth2.isSignedIn.get()) {
				updateUser(auth2.currentUser.get());
			} else {
				attachSignin(document.getElementById('customBtn'), auth2);
			}
		};
		setAuth2();
	}, []);

	useEffect(() => {
		// loading llogin/sign in button
		if (!user) {
			const setAuth2 = async () => {
				const auth2 = await loadAuth2(gapi, process.env.REACT_APP_CLENT_ID, '');
				attachSignin(document.getElementById('customBtn'), auth2);
			};
			setAuth2();
		}
	}, [user]);

	const updateUser = (currentUser) => {
		// getting basic informatin about the user

		const name = currentUser.getBasicProfile().getName();
		const profileImg = currentUser.getBasicProfile().getImageUrl();
		setUser({
			name: name,
			profileImg: profileImg,
			token: currentUser.xc.access_token,
		});
	};

	const attachSignin = (element, auth2) => {
		// Updating user variable
		auth2.attachClickHandler(
			element,
			{},
			(googleUser) => {
				updateUser(googleUser);
			},
			(error) => {
				console.log(JSON.stringify(error));
			}
		);
	};

	const handleOpenPicker = () => {
		// setting up file picker window
		openPicker({
			clientId: process.env.REACT_APP_CLENT_ID,
			developerKey: process.env.REACT_APP_DEV_KEY,
			viewId: 'DOCS',
			token: user.token,
			showUploadView: true,
			showUploadFolders: true,
			supportDrives: true,
			multiselect: true,
			customScopes: ['https://www.googleapis.com/auth/drive.metadata.readonly'],
		});
	};
	useEffect(() => {
		// UPdating file list stored in the react app
		if (data) {
			const temp = [];
			data.docs.map((i) => {
				temp.push({
					name: i.name,
					url: i.url,
				});
			});
			// console.log(temp);
			setFileList([...fileList, ...temp]);
		}
	}, [data]);

	const signOut = () => {
		// Handling log out button
		const auth2 = gapi.auth2.getAuthInstance();
		auth2.signOut().then(() => {
			setUser(null);
			setFileList([]);
			console.log('User signed out.');
		});
	};
	console.log(fileList);
	return (
		<>
			<Grid container className='container'>
				<Grid item xs={11} sm={10} md={5}>
					<Paper className='paper'>
						<section className='paper__section'>
							<Typography
								style={{ fontFamily: 'Macondo' }}
								variant='h2'
								gutterBottom
								component='div'
							>
								Drive Z
							</Typography>
						</section>
						<section className='paper__section'>
							{user && (
								<Button
									id=''
									className='paper__button'
									variant='contained'
									onClick={signOut}
								>
									Logout
								</Button>
							)}
							{!user && (
								<Button
									// style={{ background: 'pink' }}
									className='paper__button'
									variant='contained'
									id='customBtn'
								>
									Connect to Google Drive
								</Button>
							)}

							<Button
								className='paper__button'
								variant='contained'
								onClick={() => handleOpenPicker()}
								disabled={!user}
							>
								Select file from Google Drive
							</Button>
						</section>

						<section className='paper__section'>
							<div className='paper__box'>
								<ul className='paper__box__list'>
									{fileList.length !== 0 ? (
										<>
											{fileList.map((item, index) => {
												return (
													<li className='paper__box__list__item'>
														<i class='bx bx-file' />{' '}
														<a
															href={item.url}
															target='_blank'
															className='paper__box__list__item__link'
														>
															{item.name} - Google Drive
														</a>
													</li>
												);
											})}
										</>
									) : (
										<IconEmpty className='paper__box__icon' />
									)}
								</ul>
							</div>
						</section>
					</Paper>
				</Grid>
			</Grid>
		</>
	);
};

export default Drive;
