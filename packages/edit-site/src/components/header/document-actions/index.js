/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	__experimentalGetBlockLabel as getBlockLabel,
	getBlockType,
} from '@wordpress/blocks';
import { useSelect } from '@wordpress/data';
import {
	Dropdown,
	Button,
	VisuallyHidden,
	__experimentalText as Text,
} from '@wordpress/components';
import { chevronDown } from '@wordpress/icons';
import { useRef } from '@wordpress/element';

/**
 * Internal dependencies
 */
import TemplateDetails from '../../template-details';
import { getTemplateInfo } from '../../../utils';

function getBlockDisplayText( block ) {
	return block
		? getBlockLabel( getBlockType( block.name ), block.attributes )
		: null;
}

function useSecondaryText() {
	const { activeEntityBlockId, getBlock } = useSelect( ( select ) => {
		return {
			activeEntityBlockId: select(
				'core/block-editor'
			).__experimentalGetActiveBlockIdByBlockNames( [
				'core/template-part',
			] ),
			getBlock: select( 'core/block-editor' ).getBlock,
		};
	} );

	if ( activeEntityBlockId ) {
		return {
			label: getBlockDisplayText( getBlock( activeEntityBlockId ) ),
			isActive: true,
		};
	}

	return {};
}

export default function DocumentActions( { template } ) {
	const { title: documentTitle } = getTemplateInfo( template );
	const { label, isActive } = useSecondaryText();

	// Title is active when there is no secondary item, or when the secondary
	// item is inactive.
	const isTitleActive = ! label?.length || ! isActive;

	// The title ref is passed to the popover as the anchorRef so that the
	// dropdown is centered over the whole title area rather than just one
	// part of it.
	const titleRef = useRef();

	return (
		<div
			className={ classnames( 'edit-site-document-actions', {
				'has-secondary-label': !! label,
			} ) }
		>
			{ documentTitle ? (
				<>
					<div
						ref={ titleRef }
						className="edit-site-document-actions__title-wrapper"
					>
						<h1>
							<VisuallyHidden>
								{ __( 'Edit template:' ) }
							</VisuallyHidden>
							<Text
								variant={
									isTitleActive ? 'subtitle.small' : 'body'
								}
								className="edit-site-document-actions__title"
							>
								{ documentTitle }
							</Text>
						</h1>
						{ ! isActive && (
							<Dropdown
								popoverProps={ {
									anchorRef: titleRef.current,
								} }
								position="bottom center"
								renderToggle={ ( { isOpen, onToggle } ) => (
									<Button
										className="edit-site-document-actions__get-info"
										icon={ chevronDown }
										aria-expanded={ isOpen }
										aria-haspopup="true"
										onClick={ onToggle }
										label={ __( 'Show template details' ) }
									/>
								) }
								renderContent={ () => (
									<TemplateDetails template={ template } />
								) }
							/>
						) }
					</div>

					<Text
						variant={ isActive ? 'subtitle.small' : 'body' }
						className="edit-site-document-actions__secondary-item"
					>
						{ label ?? '' }
					</Text>
				</>
			) : (
				__( 'Loading…' )
			) }
		</div>
	);
}
