import React from 'react';
import GroupListItem from '../components/GroupListItem';
import GroupSelector from './GroupSelector'
import RaisedButton from 'material-ui/RaisedButton'
import styles from './GroupList.css';

export default class GroupList extends React.Component {
    state = {
        isSelectingGroups: false
    }
    componentDidMount() {
        const { groupsOrder: groupIds } = this.props
        if (!groupIds || groupIds.length === 0) 
            this.setState({ isSelectingGroups: true })
    }
    render() {
        const { groupsData, groupsOrder, onSelect, onRemove, currentGroupId } = this.props
        return (
            <div className={styles.container}>
                <div>
                    {groupsOrder.filter(gid => gid in groupsData).map(gid => (
                        <GroupListItem
                            key={gid}
                            group={groupsData[gid]}
                            isBeingSelected={gid === currentGroupId}
                            onSelect={onSelect}
                            onRemove={onRemove}
                        />
                    ))}
                </div>
                <RaisedButton 
                    label='Thêm nhóm...'
                    primary={true}
                    onClick={() => this.setState({ isSelectingGroups: true })}
                />
                <GroupSelector 
                    existedGroups={groupsOrder}
                    open={this.state.isSelectingGroups} 
                    onRequestClose={() => this.setState({ isSelectingGroups: false })}
                    onSelect={this.props.onAddGroups}
                    accessToken={this.props.accessToken}
                />
            </div>
        )
    }
}