import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MobileStepper,
  Paper,
  Stepper,
  Theme,
  Typography,
  useTheme,
} from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import React, { useRef, useState } from 'react';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { DropzoneArea } from 'material-ui-dropzone';
import { useEffect } from 'react';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';
import UploadIcon from '../UploadIcon.svg';
import CloseIcon from '@mui/icons-material/Close';
import LoadingMask from './LoadingMask';
import CreateIcon from '@mui/icons-material/Create';
import { AspectRatio } from './ChakraAspectRatio';
import BillPreview from '../LogoBillPreview.jpg';
import CardPreview from '../LogoCardPreview.jpg';
import ReceiptPreview from '../LogoReceiptPreview.jpg';
import TablePreview from '../LogoTablePreview.jpg';
import mergeImages from 'merge-images';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(0),
    },
    closeButton: {
      position: 'absolute',
      right: theme.spacing(1),
      top: theme.spacing(1),
      color: theme.palette.uxGrey.main,
    },
    logoTitle: {
      paddingBottom: 0,
      letterSpacing: 1.5,
    },
    logoSubTitle: {
      paddingTop: 0,
    },
    contentPaper: {
      width: '100%',
      position: 'relative',
    },
    logoContent: {
      width: '100%',
      display: 'flex',
      minHeight: 200,
      [theme.breakpoints.down('md')]: {
        minHeight: '60vh',
        paddingTop: 100,
      },
      justifyContent: 'center',
      padding: theme.spacing(3),
      '& .MuiDropzoneArea-root': {
        minHeight: 'unset',
        width: '100%',
        height: 'inherit',
        border: '1px dashed #00000099',
        '& .MuiDropzoneArea-textContainer': {
          display: 'flex',
          // Switch direction of the row so the icon comes first.
          flexDirection: 'row-reverse',
          justifyContent: 'center',
          height: '100%',
          alignItems: 'center',
          '& .MuiDropzoneArea-icon': {
            color: theme.palette.uxBlue.activated,
            display: 'none',
          },
          '& .MuiDropzoneArea-text': {
            display: 'none',
          },
        },
      },
      '& .cropper-point': {
        backgroundColor: theme.palette.primary.main,
      },
      '& .cropper-line': {
        backgroundColor: theme.palette.primary.main,
      },
      '& .point-nw': {
        opacity: 1,
        backgroundColor: 'white',
        height: '24px',
        width: '24px',
        border: `1px solid ${theme.palette.primary.main}`,
        borderRadius: 24,
        left: '-12px',
        top: '-12px',
      },
      '& .point-ne': {
        opacity: 1,
        backgroundColor: 'white',
        height: '24px',
        width: '24px',
        border: `1px solid ${theme.palette.primary.main}`,
        borderRadius: 24,
        right: '-12px',
        top: '-12px',
      },
      '& .point-se': {
        opacity: 1,
        backgroundColor: 'white',
        height: '24px',
        width: '24px',
        border: `1px solid ${theme.palette.primary.main}`,
        borderRadius: 24,
        bottom: '-12px',
        right: '-12px',
      },
      '& .point-sw': {
        opacity: 1,
        backgroundColor: 'white',
        height: '24px',
        width: '24px',
        border: `1px solid ${theme.palette.primary.main}`,
        borderRadius: 24,
        bottom: '-12px',
        left: '-12px',
      },
    },
    previewDashedBorder: {
      border: '1px dashed #00000099',
    },
    error: {
      padding: 0,
      backgroundColor: theme.palette.error.light,
    },
    errorText: {
      paddingRight: theme.spacing(3),
      paddingLeft: theme.spacing(3),
      paddingTop: 4,
      paddingBottom: 4,
      color: theme.palette.error.main,
      fontWeight: 400,
    },
    stepperActions: {
      padding: theme.spacing(0, 3, 0, 3),
      justifyContent: 'center',
    },
    stepper: {
      backgroundColor: 'transparent',
      minWidth: 300,
      width: '50%',
    },
    stepperComp: {
      padding: theme.spacing(0),
      justifyContent: 'center',
    },
    stepperPaper: {
      justifyContent: 'center',
      maxWidth: 320,
      minWidth: 280,
      display: 'flex',
      flexDirection: 'column',
    },
    messagePaper: {
      display: 'flex',
      width: '100%',
      justifyContent: 'center',
    },
    previewMessage: {
      maxWidth: 400,
      alignSelf: 'center',
      padding: theme.spacing(2),
    },
    logoActions: {
      padding: theme.spacing(2),
    },
    logoButtons: {
      paddingRight: theme.spacing(3),
      paddingLeft: theme.spacing(3),
      [theme.breakpoints.down('md')]: {
        paddingRight: theme.spacing(1.5),
        paddingLeft: theme.spacing(1.5),
      },
    },
    dropZoneOverlay: {
      position: 'absolute',
      display: 'flex',
      margin: 'auto',
      pointerEvents: 'none',
      height: '100%',
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      top: 0,
      [theme.breakpoints.down('md')]: {
        top: '-32%',
        flexDirection: 'column',
      },
    },
    dropZoneOverlayIconImage: {
      width: '180px',
      [theme.breakpoints.down('md')]: {
        width: '120px',
      },
    },
    dropZoneOverlayText: {
      [theme.breakpoints.up('xs')]: {
        alignContent: 'flex-start',
        marginTop: 25,
        marginLeft: 12,
      },
      [theme.breakpoints.down('md')]: {
        fontSize: '.8em',
        alignContent: 'center',
        marginTop: 0,
        textAlign: 'center',
        marginLeft: 0,
      },
    },
    dropZoneTextLine1: {
      fontSize: '1.15em',
    },
    browseText: {
      color: theme.palette.primary.main,
    },
    dropZoneTextLine2: {
      fontSize: '1em',
      color: theme.palette.uxGrey.border,
    },
    dropZoneTextLine3: {
      fontSize: '.9em',
      color: theme.palette.uxGrey.border,
    },
    formProgress: {
      color: theme.palette.primary.main,
      position: 'absolute',
      top: '50%',
      left: '50%',
      marginTop: -25,
      marginLeft: -25,
    },
    companyLogo: {
      maxWidth: 225,
      maxHeight: 75,
      margintLeft: theme.spacing(2),
    },
  }),
);
interface LogoProps {
  handleNewLogo: (logo: File, highResLogo?: File) => void;
  highResLogoUrl: string | undefined;
  logoUrl: string | undefined;
  networkBusy: boolean | undefined;
  canEdit: boolean;
}

const Logo: React.FC<LogoProps> = props => {
  const { handleNewLogo, networkBusy, logoUrl, highResLogoUrl, canEdit } = props;
  const cropperRef = useRef<HTMLImageElement>(null);
  const classes = useStyles();
  const theme = useTheme();
  const [logoOpen, setLogoOpen] = useState(false);
  const [inPreview, setInPreview] = useState(false);
  const [highResImgSrc, setHighResImgSrc] = useState<string>();
  const [croppedImgSrc, setCroppedImgSrc] = useState<string>();
  const [croppedImgBlob, setCroppedImgBlob] = useState<Blob>();
  const [highResFile, sethHighResFile] = useState<File>();
  const [activeStep, setActiveStep] = useState(0);
  const [previewImg, setPreviewImg] = useState<string>();
  const [previewLogoImg, setPreviewLogoImg] = useState<string>();
  const [previewText, setPreviewText] = useState<string>();
  const [isNewImg, setIsNewImg] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState(false); // Submitted state of the image
  const [oldLogo] = useState(logoUrl); // Submitted state of the image
  const [oldHighResLogo] = useState(highResLogoUrl); // Submitted state of the image
  const maxSteps = 5;
  const handleFileLoad = (event: ProgressEvent<FileReader>) => {
    if (event?.target?.result) {
      setHighResImgSrc(event.target.result as string);
    }
  };

  // Always start with inPreview to false.
  useEffect(() => {
    setIsNewImg(false);
    setInPreview(false);
    setActiveStep(0);
    setSubmitted(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const imageElement: any = cropperRef?.current;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cropper: any = imageElement?.cropper;
    if (cropper) {
      // Force a clear on the cropper.
      // Sometimes the previous high res logo will remain on top in the cropper if editing was done in the same session.
      cropper.clear();
    }
    if (highResLogoUrl || logoUrl) {
      setHighResImgSrc(highResLogoUrl || logoUrl);
    }
    setCroppedImgSrc(undefined);
  }, [logoOpen]);

  useEffect(() => {
    setIsNewImg(false);
    if (highResLogoUrl || logoUrl) {
      setHighResImgSrc(highResLogoUrl || logoUrl);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const imageElement: any = cropperRef?.current;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cropper: any = imageElement?.cropper;
    if (cropper) {
      // Force a clear on the cropper.
      // Sometimes the previous high res logo will remain on top in the cropper if editing was done in the same session.
      cropper.clear();
    }
    setSubmitted(false);
    setInPreview(false);
    setActiveStep(0);
  }, []);

  const handleLogoClose = () => {
    setLogoOpen(false);
  };

  useEffect(() => {
    // Once the new logo is saved, and the form is truly submitted, close window.
    if (highResLogoUrl && logoUrl && submitted && oldLogo !== logoUrl && oldHighResLogo !== highResLogoUrl) {
      handleLogoClose();
      setSubmitted(false);
    }
  }, [highResLogoUrl, logoUrl]);

  const handleLogoOpen = () => {
    setLogoOpen(true);
  };
  const handleImageUpload = (files: File[]) => {
    if (files && files.length > 0) {
      const reader = new FileReader();
      reader.onload = handleFileLoad;
      reader.readAsDataURL(files[0]);
      // We changed image, so to true.
      setIsNewImg(true);
      sethHighResFile(files[0]);
    }
  };

  const handleBack = () => {
    setInPreview(false);
  };

  const changeImage = () => {
    setHighResImgSrc(undefined);
    setInPreview(false);
  };

  const handlePreviewClick = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const imageElement: any = cropperRef?.current;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cropper: any = imageElement?.cropper;
    // Use 1000 max width for the cropped img source, so we don't use too large of a resolution locally.
    const croppedImageSource = cropper.getCroppedCanvas({ maxWidth: 1000 }).toDataURL();
    setCroppedImgSrc(croppedImageSource);
    // This is keeping the state of the logo img used for merging into the preview images.
    setPreviewLogoImg(cropper.getCroppedCanvas({ maxWidth: 120, height: 45 }).toDataURL());
    // Use maxWidth of 302, 1 px cropper edges on top and bottom will save output as 300. Double the expected size, so quality isnt comprimised as much.
    cropper.getCroppedCanvas({ maxWidth: 302 }).toBlob((blob: Blob) => {
      setCroppedImgBlob(blob);
      setPreviewImg(croppedImageSource);
      setInPreview(true);
      setActiveStep(0);
    });
  };

  const handleSaveClick = async () => {
    if (croppedImgBlob) {
      const file = new File([croppedImgBlob], 'tempfilename.png', { type: 'image/png' });
      handleNewLogo(file, isNewImg ? highResFile : undefined);
      setSubmitted(true);
    }
  };
  const handleStepperBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1);
  };

  const handleStepperNext = () => {
    setActiveStep(prevActiveStep => prevActiveStep + 1);
  };

  // Adjust content when active step changes.
  useEffect(() => {
    if (previewLogoImg) {
      switch (activeStep) {
        case 1:
          setPreviewText('This is how your logo will look when customers receive a bill-for-service email.');
          mergeImages([
            { src: BillPreview, x: 0, y: 0 },
            { src: previewLogoImg, x: 30, y: 20 },
          ]).then((b64: string) => setPreviewImg(b64));
          break;
        case 2:
          setPreviewText('This is how your logo will look when customers select your company on the payer portal.');
          mergeImages([
            { src: CardPreview, x: 0, y: 0 },
            { src: previewLogoImg, x: 430, y: 32 },
          ]).then((b64: string) => setPreviewImg(b64));
          break;
        case 3:
          setPreviewText('This is how your logo will look when customers view your invoices on the payer portal.');
          mergeImages([
            { src: TablePreview, x: 0, y: 0 },
            { src: previewLogoImg, x: 30, y: 19 },
          ]).then((b64: string) => setPreviewImg(b64));
          break;
        case 4:
          setPreviewText('This is how your logo will look in emailed receipts.');
          mergeImages([
            { src: ReceiptPreview, x: 0, y: 0 },
            { src: previewLogoImg, x: 32, y: 78 },
          ]).then((b64: string) => setPreviewImg(b64));
          break;
        case 0:
        default:
          setPreviewText('This is the image that you uploaded.');
          setPreviewImg(croppedImgSrc);
          break;
      }
    }
  }, [activeStep]);

  const editLogoModal = (
    <Dialog
      aria-label={'edit logo dialog'}
      open={logoOpen}
      onClose={handleLogoClose}
      maxWidth="md"
      fullWidth={true}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <DialogTitle data-cy="logo-dialog-title" variant={'label1'} className={classes.logoTitle} id="modal-title">
        BRANDING
      </DialogTitle>
      <DialogTitle className={classes.logoSubTitle} id="modal-description">
        Add a Company Logo
      </DialogTitle>
      <IconButton
        aria-label="close"
        data-cy="logo-dialog-close"
        className={classes.closeButton}
        onClick={handleLogoClose}
        size="large"
      >
        <CloseIcon />
      </IconButton>
      <DialogContent className={classes.logoContent}>
        <div className={classes.contentPaper}>
          {!highResImgSrc && (
            <AspectRatio ratio={2 / 1} data-cy="logo-dropzone-wrap">
              <DropzoneArea
                filesLimit={1}
                maxFileSize={1040000} // ~1mb limit.
                acceptedFiles={['image/jpg', 'image/jpeg', 'image/png']}
                dropzoneText={'Drop your file here or browse Max file size: 1MB'}
                showPreviewsInDropzone={false}
                showFileNamesInPreview={true}
                dropzoneParagraphClass={'ezpay-dropzone-paragraph'}
                dropzoneClass={'ezpay-dropzone-body'}
                onChange={handleImageUpload}
                alertSnackbarProps={{
                  // Used for cypress.
                  className: 'logo-upload-alert-message',
                }}
              />
            </AspectRatio>
          )}
          {!highResImgSrc && (
            <div className={classes.dropZoneOverlay}>
              <img alt="dropzone overlay icon" className={classes.dropZoneOverlayIconImage} src={UploadIcon} />
              <div>
                <div className={classes.dropZoneOverlayText}>
                  <div>
                    <span className={classes.dropZoneTextLine1}>
                      Drop your file here or <span className={classes.browseText}>browse</span>
                    </span>
                  </div>
                  <div>
                    <span className={classes.dropZoneTextLine2}>Max file size: 1MB</span>
                  </div>
                  <div>
                    <span className={classes.dropZoneTextLine3}>JPG, PNG</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          {!inPreview && highResImgSrc && (
            <AspectRatio ratio={2 / 1}>
              <Cropper
                src={highResImgSrc}
                style={{
                  width: '100%',
                  height: '100%',
                  overflow: 'visible',
                }}
                // Cropper.js options
                initialAspectRatio={2 / 1}
                aspectRatio={2 / 1}
                autoCropArea={100}
                autoCrop={true}
                data-cy="logo-cropper"
                guides={false}
                ref={cropperRef}
                dragMode="move"
                cropBoxMovable={false}
              />
            </AspectRatio>
          )}
          {inPreview && (
            <Stepper className={classes.stepperComp}>
              <Paper className={classes.stepperPaper} elevation={0}>
                <img alt="logo preview" className={activeStep === 0 ? classes.previewDashedBorder : undefined} src={previewImg}></img>
                <Paper className={classes.messagePaper} elevation={0}>
                  <Typography className={classes.previewMessage} align={'center'}>
                    {previewText}
                  </Typography>
                </Paper>
              </Paper>
            </Stepper>
          )}
        </div>
      </DialogContent>
      {inPreview && (
        <DialogActions className={classes.stepperActions}>
          <MobileStepper
            className={classes.stepper}
            steps={maxSteps}
            position="static"
            activeStep={activeStep}
            nextButton={
              <Button
                color={'primary'}
                size="small"
                data-cy="logo-preview-previous"
                onClick={handleStepperNext}
                disabled={activeStep === maxSteps - 1}
                aria-label="forward navigation"
              >
                {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
              </Button>
            }
            backButton={
              <Button
                color={'primary'}
                size="small"
                data-cy="logo-preview-next"
                onClick={handleStepperBack}
                disabled={activeStep === 0}
                aria-label="backward navigation"
              >
                {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
              </Button>
            }
          />
        </DialogActions>
      )}
      <DialogActions className={classes.logoActions}>
        {!inPreview && (
          <Button
            color="primary"
            variant="text"
            onClick={handleLogoClose}
            className={classes.logoButtons}
            data-cy="cancel-logo-upload"
          >
            Cancel
          </Button>
        )}
        {inPreview && (
          <Button color="primary" variant="text" onClick={handleBack} className={classes.logoButtons} data-cy="back-from-preview">
            Back
          </Button>
        )}
        {highResImgSrc && (
          <Button color="primary" variant="text" onClick={changeImage} className={classes.logoButtons} data-cy="change-image">
            New Image
          </Button>
        )}
        {!inPreview && (
          <Button
            disabled={!highResImgSrc}
            color="primary"
            variant="contained"
            className={classes.logoButtons}
            data-cy="preview-logo"
            onClick={handlePreviewClick}
          >
            NEXT
          </Button>
        )}
        {inPreview && (
          <Button color="primary" variant="contained" className={classes.logoButtons} data-cy="save-logo" onClick={handleSaveClick}>
            SAVE
          </Button>
        )}
        <LoadingMask loading={networkBusy || submitted} />
      </DialogActions>
    </Dialog>
  );
  return (
    <>
      {logoUrl && <img alt="merchant logo" className={classes.companyLogo} data-cy="merchant-logo-image" src={logoUrl} />}
      {canEdit && (
        <Button
          variant="outlined"
          color="primary"
          onClick={handleLogoOpen}
          size="small"
          data-cy="merchant-logo-edit"
          startIcon={logoUrl ? <CreateIcon /> : undefined}
        >
          {!logoUrl ? 'Add Logo Image' : 'Edit'}
        </Button>
      )}
      {editLogoModal}
    </>
  );
};

export default Logo;
