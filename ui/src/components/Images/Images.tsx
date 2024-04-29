import React, { SetStateAction, useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../reducers/hooks';
import { createAlert, createPrompt } from '../../reducers/alertReducer';
import styles from './Images.module.scss';
import { ImageType } from '../../../../types';
import { ImagesStateType, ModifiedObject } from '../../../ui-types';
import {
	fetchImages,
	deleteImage,
	updateIsSaved,
} from '../../reducers/imageReducer';
import Client from '../../models/Client';
import ImageCard from '../ImageCard/ImageCard';
import ImagesSummary from '../ImagesSummary/ImagesSummary';
import CompareModal from './CompareModal/CompareModal';
import { resetImageProperties } from '../../reducers/imageReducer';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Tooltip, IconButton } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import Zoom from '@mui/material/Zoom';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

/**
 * @module | Images.tsx
 * @description | Provides ability to pull images from DockerHub image repository, run images, and remove images
 **/

const Images = (): React.JSX.Element => {
	console.log('Rendering Images component');
	const [scanDone, setScanDone] = useState<boolean>(false);
	const [reset, setReset] = useState<boolean>(false);
	const [isHovered, setIsHovered] = useState<string>('');
	const [compareModal, setCompareModal] = useState<boolean>(false);

	const dispatch = useAppDispatch();

	const imagesList: ImageType[] = useAppSelector(
		(state) => state.images.imagesList
	);
	const time: string = useAppSelector((state) => state.images.timeStamp);
	const isSavedState: boolean = useAppSelector((state) => state.images.isSaved);
	const totalVul: number = useAppSelector((state) => state.images.totalVul);

	// If imagesList is not populated, send a dispatch that will fetch the list of docker images from the backend
	useEffect(() => {
		if (!imagesList.length || reset) {
			dispatch(fetchImages());
		}
	}, []);

	const runImage = async (image: ImageType) => {
		const success = await Client.ImageService.runImage(
			image.Repository,
			image.Tag
		);
		if (success) dispatch(fetchImages());
	};

	const removeImage = async (imageId: string) => {
		const success = await Client.ImageService.removeImage(imageId);
		if (success) {
			dispatch(deleteImage(imageId));
		}
	};

	const runImageAlert = (imgObj: ImageType) => {
		dispatch(
			createPrompt(
				`Are you sure you want to run ${imgObj.Repository}?`,
				() => {
					runImage(imgObj);
					dispatch(
						createAlert(`Running ${imgObj.Repository}...`, 2, 'success')
					);
				},
				() => {
					dispatch(
						createAlert(
							`The request to run ${imgObj.Repository} has been cancelled.`,
							2,
							'warning'
						)
					);
				}
			)
		);
	};

	const removeImageAlert = (imgObj: ImageType) => {
		dispatch(
			createPrompt(
				`Are you sure you want to remove ${imgObj.Repository}?`,
				() => {
					removeImage(imgObj.ID);
					dispatch(
						createAlert(`Removing ${imgObj.Repository}...`, 2, 'success')
					);
				},
				() => {
					dispatch(
						createAlert(
							`The request to remove ${imgObj.Repository} has been cancelled.`,
							2,
							'warning'
						)
					);
				}
			)
		);
	};

	const saveScanHandler = async () => {
		// get UserIP --> IPv4
		const response = await fetch('https://api.ipify.org?format=json');
		const data = await response.json();
		const userIP = data.ip;

		const success: { printSavedScan: object; saved: boolean } =
			await Client.ImageService.saveScan(imagesList, time, userIP);

		//Example returned response: { printSavedScan: res.locals.savedScan, saved: true }

		// print to check
		if (success)
			console.log('Scan saved: ', JSON.stringify(success.printSavedScan));

		// update save button state in Redux
		const isSaved: boolean = success.saved;
		console.log('IS SAVED: ', isSaved);
		dispatch(updateIsSaved({ isSaved }));
	};

	let renderedImages: React.JSX.Element[] = imagesList.map((imageObj, i) => (
		<ImageCard
			removeImageAlert={removeImageAlert}
			runImageAlert={runImageAlert}
			key={i}
			index={i} // 1
			imgObj={imageObj} //current image in the imagesList
			reset={reset}
			setReset={setReset}
			isHovered={isHovered}
		/>
	));

	return (
		<div className={styles.ImagesContainer}>
			<h2 className={styles.VulnerabilitiesTitle}>
				<div style={{ position: 'relative', display: 'inline-block' }}>
					<span>VULNERABILITY </span>
					<Tooltip
						title='Hover or Click for Severity Filter!'
						placement='right-end'
						arrow
						TransitionComponent={Zoom}>
						<IconButton
							style={{ position: 'absolute', top: '-10px', left: '-35px' }}>
							<InfoIcon />
						</IconButton>
					</Tooltip>
				</div>{' '}
				{totalVul !== 0 && (
					<span style={{ color: '#94c2ed' }}>{`- Total: ${totalVul}`}</span>
				)}
			</h2>
			{/* VULNERABILITY SUMMARY INFO */}
			<div>
				<ImagesSummary
					setScanDone={setScanDone}
					reset={reset}
					isHovered={isHovered}
					setIsHovered={setIsHovered}
				/>
			</div>
			<div className={styles.buttonDiv}>
				{/* RESCAN */}
				<button
					className={scanDone ? styles.button : styles.buttonLoad}
					onClick={() => {
						if (scanDone) {
							dispatch(resetImageProperties());
							setReset(true);
							setIsHovered('');
							toast.success('Rescanning...!', {
								position: 'top-right',
								autoClose: 3000,
								hideProgressBar: false,
								closeOnClick: true,
								pauseOnHover: false,
								draggable: true,
								progress: undefined,
								theme: 'dark',
							});
						}
					}}>
					RESCAN
				</button>
				{/* SAVE SCAN */}
				<button
					className={
						scanDone && !isSavedState ? styles.button : styles.buttonLoad
					}
					onClick={() => {
						if (scanDone && !isSavedState) {
							saveScanHandler();
							toast.success('Scan Saved!', {
								position: 'top-right',
								autoClose: 3000,
								hideProgressBar: false,
								closeOnClick: true,
								pauseOnHover: false,
								draggable: true,
								progress: undefined,
								theme: 'dark',
							});
						}
					}}>
					SAVE SCAN
				</button>
				{/* COMPARE */}
				<button className={styles.button} onClick={() => setCompareModal(true)}>
					HISTORY
				</button>
			</div>
			<h2 className={styles.VulnerabilitiesTitle}>
				<div style={{ position: 'relative', display: 'inline-block' }}>
					<span>Image </span>
					<Tooltip
						title='DoubleClick each card for more info!'
						placement='right-start'
						arrow
						TransitionComponent={Zoom}>
						<IconButton
							style={{ position: 'absolute', top: '-25px', right: '40px' }}>
							<InfoIcon />
						</IconButton>
					</Tooltip>
				</div>
				{' - '}Last Scan:
				<span style={{ color: '#94c2ed' }}> {time && `${time}`} </span>
			</h2>
			{imagesList.length === 0 && <h4 style={{ marginLeft: '0.8%' }}>Note: Scanning images can take time...</h4 >}
			{/* IMAGE CARDS */}
			<div className={styles.ImagesCardsView}>{renderedImages}</div>
			{
				imagesList.length === 0 && (
					<Box sx={{ display: 'flex', justifyContent: 'center', mt: '5%'}}>
						<CircularProgress />
					</Box>
				)
			}
			<ToastContainer
				position='top-right'
				autoClose={3000}
				hideProgressBar={false}
				newestOnTop={false}
				closeOnClick
				rtl={false}
				pauseOnFocusLoss
				draggable
				pauseOnHover={false}
				theme='dark'
						/>
			{compareModal && <div className={styles.backdrop}></div>}
			<div className={styles.modalContainer}>
				<CompareModal trigger={compareModal} setTrigger={setCompareModal} />
			</div>
		</div>
	);
};

export default Images;
