import { Button, Grid, Paper, Typography } from '@mui/material';
import '../styles/drive.css';
import { ReactComponent as IconEmpty } from '../assets/empty.svg';
import { useEffect, useState } from 'react';
import useDrivePicker from 'react-google-drive-picker';
import { gapi, loadAuth2 } from 'gapi-script';

const Drive = () => {
	const [user, setUser] = useState(null);
	const [openPicker, data, authResponse] = useDrivePicker();
	const [fileList, setFileList] = useState([]);

	useEffect(() => {
		const setAuth2 = async () => {
			const auth2 = await loadAuth2(
				gapi,
				'90059057405-72151fio0d8r9r58a4ge09kgr9790vel.apps.googleusercontent.com',
				''
			);
			if (auth2.isSignedIn.get()) {
				updateUser(auth2.currentUser.get());
			} else {
				attachSignin(document.getElementById('customBtn'), auth2);
			}
		};
		setAuth2();
	}, []);

	useEffect(() => {
		if (!user) {
			const setAuth2 = async () => {
				const auth2 = await loadAuth2(
					gapi,
					'90059057405-72151fio0d8r9r58a4ge09kgr9790vel.apps.googleusercontent.com',
					''
				);
				attachSignin(document.getElementById('customBtn'), auth2);
			};
			setAuth2();
		}
	}, [user]);

	const updateUser = (currentUser) => {
		const name = currentUser.getBasicProfile().getName();
		const profileImg = currentUser.getBasicProfile().getImageUrl();
		setUser({
			name: name,
			profileImg: profileImg,
			token: currentUser.xc.access_token,
		});
	};

	const attachSignin = (element, auth2) => {
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
		const auth2 = gapi.auth2.getAuthInstance();
		auth2.signOut().then(() => {
			setUser(null);
			setFileList([]);
			console.log('User signed out.');
		});
	};
	const arr = ['hi', 'helllo'];
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
