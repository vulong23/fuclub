import React from 'react'
import InputButtons from '../components/InputButtons'
import TextField from 'material-ui/TextField'
import FlatButton from 'material-ui/FlatButton'
import Dialog from 'material-ui/Dialog'
import LinearProgress from 'material-ui/LinearProgress'

import styles from './InputField.css'
import * as db from '../services/db';
import * as storage from '../services/storage';

export default class InputField extends React.Component {
    state = {
        message: '',
        alertFileIsTooLarge: false,
        alertAnotherFileIsBeingUploaded: false,
        uploadingProgress: null
    }
    constructor(props) {
        super(props)
        this.upload = storage.SingleUploadThread()
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.groupId !== this.props.groupId)
            document.getElementById('input-typing-field').focus()
    }

    sendMessage = () => {
        const { user, groupId } = this.props
        const messageObject = db.makeMessage(
            db.messageTypes.TEXT, 
            this.state.message, 
            user
        )
        if (messageObject) db.addMessage(groupId, messageObject)
        this.setState({ message: '' })
    }
    handleKeyDown = (event) => {
        if (event.keyCode === 13 && !event.shiftKey) {  // if enter with no shift get pressed 
            event.preventDefault()
            event.stopPropagation()
            this.sendMessage()           
        }
    }
    handleFileSelected = async (file) => {
        if (file.size > storage.MAXIMUM_FILE_SIZE) {
            this.setState({ alertFileIsTooLarge: true })
            return
        }
        if (this.upload.isUploading) {
            this.setState({ alertAnotherFileIsBeingUploaded: true })
            return
        }
        this.upload.onProgress(progress => this.setState({ uploadingProgress: progress }))
        const { user, groupId } = this.props
        const downloadURL = await this.upload.upFile(file, user.id, groupId)
        const messageObject = db.makeMessage(
            db.messageTypes.FILE,
            {
                name: file.name,
                downloadURL,
                type: file.type
            },
            user
        )
        if (messageObject) db.addMessage(groupId, messageObject)
    }

    render() {
        return (
            <div className='outerContainer'>
                {this.state.uploadingProgress && 
                <LinearProgress mode='determinate' value={this.state.uploadingProgress} />}
                
                <div className={styles.container}>
                    <TextField 
                        id='input-typing-field'
                        multiLine={true}
                        hintText='Type a message...'
                        underlineShow={false}
                        onKeyDown={this.handleKeyDown}
                        onChange={e => this.setState({ message: e.target.value })}
                        value={this.state.message}
                        fullWidth={true}
                        rowsMax={8}
                        autoFocus={true}
                    />
                    <InputButtons onSend={this.sendMessage} onFileSelected={this.handleFileSelected} />

                    <Dialog
                        actions={<FlatButton 
                            label='Ok' 
                            onClick={() => this.setState({ alertFileIsTooLarge: false })} 
                            primary={true}
                        />}
                        open={this.state.alertFileIsTooLarge}
                        onRequestClose={() => this.setState({ alertFileIsTooLarge: false })}
                    >
                        The file you have chosen is too large. The maximum file size is 10MB.
                    </Dialog>
                    <Dialog
                        actions={<FlatButton 
                            label='Ok' 
                            onClick={() => this.setState({ alertAnotherFileIsBeingUploaded: false })} 
                            primary={true}
                        />}
                        open={this.state.alertAnotherFileIsBeingUploaded}
                        onRequestClose={() => this.setState({ alertAnotherFileIsBeingUploaded: false })}
                    >
                        Another file is being uploaded.
                    </Dialog>
                </div>
            </div>
            
        )
    }
}