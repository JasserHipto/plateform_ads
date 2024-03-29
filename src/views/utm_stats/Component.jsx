import React, { useState, useEffect } from 'react';
import { Grid, Typography, Button } from '@mui/material';
import Select from 'react-select';
import '../pioche/components/selection.css';
import { BASE_URL, api_version } from '../authentication/config';
import { FaFileExport } from 'react-icons/fa';
import { ImLoop2 } from 'react-icons/im';

function Component({
  onVerticalSelect,
  onVerticalSelectName,
  onDateFromSelect,
  onDateToSelect,
  onRecalculateClick,
}) {
  async function getToken() {
    const token = localStorage.getItem('token');
    if (token) {
      return token;
    } else {
      throw new Error('No token available');
    }
  }

  const fetchVerticals = async () => {
    try {
      const token = await getToken();
      const responseObject = JSON.parse(token);
      const accessToken = responseObject.access_token;
      const formdata = new FormData();
      formdata.append('Hipto-Authorization', accessToken);
      const requestOptions = {
        method: 'POST',
        body: formdata,
      };
      const response = await fetch(`${BASE_URL}/${api_version}/verticals`, requestOptions);
      const data = await response.json();
      setVerticals(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchVerticals();
  }, []);

  const [verticals, setVerticals] = useState([]);
  const [selectedVertical, setSelectedVertical] = useState([]);
  const [selectedDateFrom, setSelectedDateFrom] = useState(new Date().toISOString().substr(0, 10));
  const [selectedDateTo, setSelectedDateTo] = useState(new Date().toISOString().substr(0, 10));

  const handleVerticalSelect = (selectedOption) => {
    setSelectedVertical(selectedOption); // Mettre à jour l'état avec la nouvelle option sélectionnée
    onVerticalSelect(selectedOption.value); // Appeler la fonction de rappel avec l'ID de la verticale
  };

  const handleDateFromChange = (dateFrom) => {
    setSelectedDateFrom(dateFrom);
    onDateFromSelect(dateFrom);
  };

  const handleDateToChange = (dateTo) => {
    setSelectedDateTo(dateTo);
    onDateToSelect(dateTo);
  };

  const handleRecalculate = async () => {
    try {
      const verticalIds = selectedVertical.map((vertical) => vertical.value);
      const verticalNames = selectedVertical.map((value) => value.label);
      onVerticalSelectName(verticalNames);
      onVerticalSelect(verticalIds);
      onDateFromSelect(selectedDateFrom);
      onDateToSelect(selectedDateTo);
      if (onRecalculateClick) {
        onRecalculateClick();
      }
    } catch (error) {
      console.error(error);
    }
  };
  // Calculer la date maximale autorisée (30 jours à partir de la date actuelle)
  const currentDate = new Date();
  const minDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() - 1,
    currentDate.getDate(),
  );

  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={4.4}>
          <Typography variant="h6" mb={1}>
            Verticales
          </Typography>
          <Select
            isMulti
            options={verticals.map((option) => ({
              value: option.vertical_id,
              label: option.vertical_code,
            }))}
            value={selectedVertical}
            onChange={handleVerticalSelect}
            placeholder="Choisir"
          />
        </Grid>
        <Grid item xs={3.6}>
          <Typography variant="h6" sx={{ fontWeight: '400' }}>
            Période
          </Typography>
          <Grid container>
            <Grid item xs={6}>
              <input
                type="date"
                className="form-control"
                value={selectedDateFrom}
                onChange={(e) => handleDateFromChange(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </Grid>
            <Grid item xs={6}>
              <input
                type="date"
                className="form-control"
                value={selectedDateTo}
                onChange={(e) => handleDateToChange(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={4} display={'flex'} alignItems={'center'}>
          <Button variant="contained" onClick={handleRecalculate} sx={{ marginRight: '10px' }}>
            <ImLoop2 /> <Typography sx={{ paddingLeft: '7px' }}>Recalculer</Typography>
          </Button>
          <Button variant="contained" color="success">
            <FaFileExport /> <Typography sx={{ paddingLeft: '7px' }}>Exporter</Typography>
          </Button>
        </Grid>
      </Grid>
    </>
  );
}

export default Component;
