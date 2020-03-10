import React, { Component } from 'react';
import { uniqueId } from "lodash";
import filesize from "filesize";

import GlobalStyle from "./styles/global";
import {
  Container,
  Content
} from "./styles";

import Upload from "./components/Upload";
import FileList from "./components/FileList";

import api from "./services/api";

const maxFileSize = 2 * 1024 * 1024;

class App extends Component {
  state = {
    uploadedFiles: []
  };

  async componentDidMount() {
    const response = await api.get("/images");
    
    this.setState({
      uploadedFiles: response.data.map(file => ({
        id: file._id,
        name: file.name,
        readableSize: filesize(file.size),
        preview: file.url,
        uploaded: true,
        url: file.url
      }))
    })
  }

  handleUpload = (files) => {
    const uploadedFiles = files.map(file => ({
      file,
      id: uniqueId(),
      name: file.name,
      readableSize: filesize(file.size),
      preview: URL.createObjectURL(file),
      progress: 0,
      uploaded: false,
      error: false,
      url: null
    }));

    this.setState({
      uploadedFiles: this.state.uploadedFiles.concat(uploadedFiles)
    });

    uploadedFiles.forEach(this.processUpload);
  };

  updateFile = (id, data) => {
    this.setState({
      uploadedFiles: this.state.uploadedFiles.map(updateFile => {
        return id === updateFile.id ? (
          { ...updateFile, ...data }
        ) : (
          updateFile
        );
      })
    });
  }

  processUpload = (uploadedFile) => {
    if (uploadedFile.file.size > maxFileSize) {
      const maxSize = filesize(maxFileSize);
      const error = "Max file size is " + maxSize;
      
      this.updateFile(uploadedFile.id, { error });

      return;
    }

    const data = new FormData();

    data.append("file", uploadedFile.file, uploadedFile.name);

    api.post("/images/upload", data, {
      onUploadProgress: e => {
        const progress = parseInt(
          Math.round((e.loaded * 100) / e.total)
        );
        this.updateFile(uploadedFile.id, {
          progress
        });
      }
    }).then(response => {
      console.log("resposta positiva", response);
      this.updateFile(uploadedFile.id, {
        uploaded: true,
        id: response.data.image._id,
        url: response.data.image.url
      });
    }).catch(response => {
      console.log("resposta negativa", response);
      this.updateFile(uploadedFile.id, {
        error: true
      });
    });
  };

  handleDelete = async (id) => {
    await api.delete(`images/${id}`);

    this.setState({
      uploadedFiles: this.state.uploadedFiles.filter(file => {
        return file.id !== id
      })
    });
  }

  componentWillUnmount () {
    this.state.uploadedFiles.forEach(file => {
      URL.revokeObjectURL(file.preview)
    });
  }

  render() {
    const { uploadedFiles } = this.state;
    return (
      <Container>
        <Content>
          <Upload onUpload={this.handleUpload} />
          { !!uploadedFiles.length && (
            <FileList
              files={uploadedFiles}
              onDelete={this.handleDelete}
            />
          )}
          <FileList />
        </Content>
        <GlobalStyle />
      </Container>
    );
  }
}

export default App;
