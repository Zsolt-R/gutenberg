/**
 * WordPress dependencies
 */
import { compose } from '@wordpress/compose';
import { MenuItem } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { isReusableBlock } from '@wordpress/blocks';
import { withSelect, withDispatch } from '@wordpress/data';
import { BlockSettingsMenuControls } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import { STORE_KEY } from '../../store/constants';

export function ReusableBlockDeleteButton( {
	isVisible,
	isDisabled,
	onDelete,
} ) {
	if ( ! isVisible ) {
		return null;
	}

	return (
		<BlockSettingsMenuControls>
			{ ( { onClose } ) => (
				<MenuItem
					disabled={ isDisabled }
					onClick={ () => {
						// TODO: Make this a <Confirm /> component or similar
						// eslint-disable-next-line no-alert
						const hasConfirmed = window.confirm(
							// eslint-disable-next-line @wordpress/i18n-no-collapsible-whitespace
							__(
								'Are you sure you want to delete this Reusable Block?\n\n' +
									'It will be permanently removed from all posts and pages that use it.'
							)
						);
						if ( hasConfirmed ) {
							onDelete();
							onClose();
						}
					} }
				>
					{ __( 'Remove from Reusable blocks' ) }
				</MenuItem>
			) }
		</BlockSettingsMenuControls>
	);
}

const REUSABLE_BLOCK_NOTICE_ID = 'REUSABLE_BLOCK_NOTICE_ID';

export default compose( [
	withSelect( ( select, { clientId } ) => {
		const { getBlock } = select( 'core/block-editor' );
		const { canUser } = select( 'core' );
		const block = getBlock( clientId );

		const reusableBlock =
			block && isReusableBlock( block )
				? select( 'core' ).getEntityRecord(
						'postType',
						'wp_block',
						block.attributes.ref
				  )
				: null;

		return {
			isVisible:
				!! reusableBlock &&
				( reusableBlock.isTemporary ||
					!! canUser( 'delete', 'blocks', reusableBlock.id ) ),
			isDisabled: reusableBlock && reusableBlock.isTemporary,
		};
	} ),
	withDispatch( ( dispatch, { clientId }, { select } ) => {
		const {
			__experimentalDeleteReusableBlock: deleteReusableBlock,
		} = dispatch( STORE_KEY );
		const { getBlock } = select( 'core/block-editor' );

		const { createSuccessNotice, createErrorNotice } = dispatch(
			'core/notices'
		);
		return {
			async onDelete() {
				const block = getBlock( clientId );
				try {
					await deleteReusableBlock( block.attributes.ref );
					createSuccessNotice( __( 'Block deleted.' ), {
						id: REUSABLE_BLOCK_NOTICE_ID,
						type: 'snackbar',
					} );
				} catch ( error ) {
					createErrorNotice( error.message, {
						id: REUSABLE_BLOCK_NOTICE_ID,
						type: 'snackbar',
					} );
				}
			},
		};
	} ),
] )( ReusableBlockDeleteButton );