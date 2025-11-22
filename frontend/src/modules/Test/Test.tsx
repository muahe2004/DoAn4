import { MenuItem, Select, TextField, Grid, IconButton, Toolbar } from "@mui/material";
import LabelPrimary from '../../components/Label/Label';
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Menu as MenuIcon } from '@mui/icons-material';
import { useSidebar } from "../../contexts/SidebarContext";
import "../../index.css";

// Add some styles for the layout
const styles = {
  toggleButton: {
    marginRight: '16px',
  },
};

function Test() {
  const { toggleSidebar } = useSidebar();

  return (
    <>
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="toggle sidebar"
          onClick={toggleSidebar}
          edge="start"
          sx={styles.toggleButton}
        >
          <MenuIcon />
        </IconButton>
        <h2>Test Page</h2>
      </Toolbar>
        
        <Grid container spacing={2} className="myprofile-form">
          <Grid size={4} className="myprofile-form__group">
            <LabelPrimary value="Quốc tịch"></LabelPrimary>
            <TextField 
              // value={nationality} 
              // onChange={(e) => setNationality(e.target.value)} 
              fullWidth 
              id="outlined-basic" 
              variant="outlined" 
              className="primary-text__field"/>
          </Grid>                     

          <Grid size={4} className="myprofile-form__group">
            <LabelPrimary value="Dân tộc"></LabelPrimary>
            <TextField 
              // value={ethnicity}
              // onChange={(e) => setEthnicity(e.target.value)} 
              fullWidth 
              id="outlined-basic" 
              variant="outlined" 
              className="primary-text__field"/>
          </Grid> 

          <Grid size={4} className="myprofile-form__group">
              <LabelPrimary value="Tôn giáo" required></LabelPrimary>
              <TextField 
                  // value={religion}
                  // onChange={(e) => setReligion(e.target.value)} 
                  fullWidth 
                  id="outlined-basic" 
                  variant="outlined" 
                  className="primary-text__field"/>
          </Grid> 

          <Grid size={4} className="myprofile-form__group">
            <LabelPrimary value="Sinh nhật"></LabelPrimary>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                className="primary-text__field"
                // value={dateOfBirth ? new Date(dateOfBirth) : null} 
                // onChange={(newValue) => setDateOfBirth(newValue ? newValue.toISOString() : "")}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>

          <Grid size={4} className="myprofile-form__group">
            <LabelPrimary value="Giới tính"></LabelPrimary>
            <Select
              disabled
              // value={gender}
              // onChange={(e) => setGender(e.target.value)}
              fullWidth
              id="outlined-select"
              variant="outlined"
              className="primary-text__field"
              defaultValue=""
              MenuProps={{
                disableScrollLock: true,   
              }}
            >
              <MenuItem value="1">Male</MenuItem>
              <MenuItem value="2">Famale</MenuItem>
              <MenuItem value="3">Other</MenuItem>
            </Select>
          </Grid>

          <Grid size={4} className="myprofile-form__group">
            <LabelPrimary value="Email"></LabelPrimary>
            <TextField 
              // value={email} 
              // onChange={(e) => setEmail(e.target.value)} 
              fullWidth 
              id="outlined-basic" 
              variant="outlined" 
              className="primary-text__field"/>
          </Grid> 

          <Grid size={6} className="myprofile-form__group myprofile-form__group--fullwidth">
            <LabelPrimary value="Địa chỉ"></LabelPrimary>
            <TextField 
              // value={address} 
              // onChange={(e) => setAddress(e.target.value)} 
              fullWidth 
              id="outlined-basic" 
              variant="outlined" 
              className="primary-text__field"/>
          </Grid> 

          <Grid size={6} className="myprofile-form__group">
            <LabelPrimary value="Quê quán"></LabelPrimary>
            <TextField 
              // value={placeOfOrigin}
              // onChange={(e) => setPlaceOfOrigin(e.target.value)}
              fullWidth 
              id="outlined-basic" 
              variant="outlined" 
              className="primary-text__field"/>
          </Grid> 

          <Grid size={4} className="myprofile-form__group">
            <LabelPrimary value="Số điện thoại" required></LabelPrimary>
            <TextField 
              // value={phone} 
              // onChange={(e) => setPhone(e.target.value)} 
              fullWidth 
              id="outlined-basic" 
              variant="outlined" 
              className="primary-text__field"/>
          </Grid> 

          <Grid size={4} className="myprofile-form__group">
            <LabelPrimary value="Chương trình đào tạo" required></LabelPrimary>
            <TextField 
              // value={trainingProgram} 
              // onChange={(e) => setTrainingProgram(e.target.value)} 
              fullWidth 
              id="outlined-basic" 
              variant="outlined" 
              className="primary-text__field"/>
          </Grid> 

          <Grid size={4} className="myprofile-form__group">
            <LabelPrimary value="Niên khoá" required></LabelPrimary>
            <TextField 
              // value={course} 
              // onChange={(e) => setCourse(e.target.value)} 
              fullWidth 
              id="outlined-basic" 
              variant="outlined" 
              className="primary-text__field"/>
          </Grid> 

          <Grid size={4} className="myprofile-form__group">
            <LabelPrimary value="Khoa"></LabelPrimary>
            <Select
              fullWidth
              id="outlined-select"
              variant="outlined"
              className="primary-text__field"
              defaultValue=""
              MenuProps={{
                  disableScrollLock: true,   
              }}
            >
              <MenuItem value="1">Department 1</MenuItem>
              <MenuItem value="2">Department 2</MenuItem>
              <MenuItem value="3">Department 3</MenuItem>
            </Select>
          </Grid>
        </Grid>
    </>
  );
}

export default Test