import React, {useState, useEffect} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import DeleteOutlinedIcon from '@material-ui/icons/DeleteOutlined';
import Pagination from '@material-ui/lab/Pagination'
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import {Link} from '@material-ui/core'
import playAction from '../actions/playAction'
import removeSong from "../actions/removeSong";
import {useDispatch} from 'react-redux';
const axios = require('axios').default;

const columns = [
    { id: 'title', label: 'Title', align: 'center', minWidth: 100 },
    { id: 'artist', label: 'Artist', align: 'center', minWidth: 100 },
    {
        id: 'albumName',
        label: 'Album Name',
        minWidth: 100,
        align: 'center',
    },
    {
        id: 'remove',
        label: 'Remove',
        minWidth: 100,
        align: 'center',
    }

];


// if(Nsong.track.preview_url){
//     dispatch(playAction.playSong(song));
// }else{
//     dispatch(playAction.toSong(song))
// }


const useStyles = makeStyles({
    root: {
        width: '100%',
    },
    container: {
        maxHeight: 700,
    },
});
const LikedPage = () => {
    const classes = useStyles();
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [favoriteSongList, SetFavoriteSongList] = useState(undefined);
    const [dataSize, SetDatSie] = useState(0);
    const [loading, SetLoading] = useState(true);
    const [error, SetError] = useState(false);

    const dispatch = useDispatch();

    async function getFavoriteSongs() {
        try {
            const userInfo = {
                userEmail: window.sessionStorage.userEmail
            };
            const favoriteSongs = await axios.post('http://localhost:5000/users/favoriteSongs', userInfo);
            let newFavoriteSongs = [];
            if(favoriteSongs.data) {
                favoriteSongs.data.map(song => {
                    let newSongFormat = {
                        storedId: song.id,
                        track: {
                            album:{
                                id: song.albumId,
                                name: song.albumName,
                            },
                            artists: [
                                {
                                    id: song.artistId,
                                    name: song.artist
                                }
                                ],
                            name: song.title,
                            preview_url: song.playUrl,
                            id: song.songId
                        },
                    };
                    newFavoriteSongs.push(newSongFormat)
                })
            }
            await SetFavoriteSongList(newFavoriteSongs);
            await SetDatSie(newFavoriteSongs.length);
            await SetLoading(false)
        } catch(e) {
            SetError(true);
            console.log({error: e})
        }
    }
    useEffect(()=> {
        getFavoriteSongs();
    }, [dataSize, page]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const handleRemoveSong = (songId) => {
        try {
            const result =  removeSong(songId);
            SetDatSie(dataSize - 1);
            if(result) {
                alert("Remove the song successfully")
            }
        } catch(e) {
            console.log({error:e})
        }
    };

    if(loading) {
        return (
            <div>Loading....</div>
        )
    } else if(error) {
        return (
            <div>Error.....</div>
        )
    } else {
        return (
            <Paper className={classes.root}>
                <TableContainer className={classes.container}>
                    <Table stickyHeader aria-label="sticky table" >
                        <TableHead>
                            <TableRow>
                                {columns.map((column) => (
                                    <TableCell
                                        key={column.id}
                                        align={column.align}
                                        style={{ minWidth: column.minWidth }}
                                    >
                                        {column.label}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {favoriteSongList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((favoriteSong) => {
                                return (
                                    <TableRow hover role="checkbox" tabIndex={-1} key={favoriteSong.storedId}>
                                        <TableCell align='center'>
                                            {favoriteSong.track? favoriteSong.track.name: '-'}
                                        </TableCell >
                                        <TableCell align='center'>
                                            <Link href={favoriteSong.track?`/albumList/${favoriteSong.track.artists[0].id}`:""} >
                                                {favoriteSong.track?favoriteSong.track.artists[0].name:'-'}
                                            </Link>
                                        </TableCell>
                                        <TableCell align='center'>
                                            <Link href={favoriteSong.track?`/albums/songsList/${favoriteSong.track.album.id}`:""}>
                                                {favoriteSong.track?favoriteSong.track.album.name:'-'}
                                            </Link>
                                        </TableCell>
                                        <TableCell align='center' onClick={()=>{handleRemoveSong(favoriteSong.storedId)}}>
                                            <DeleteOutlinedIcon/>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[10, 25, 100]}
                    component="div"
                    count={dataSize}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onChangePage={handleChangePage}
                    onChangeRowsPerPage={handleChangeRowsPerPage}
                />
            </Paper>
        );
    }
};

export default LikedPage





